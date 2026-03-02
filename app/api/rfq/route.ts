import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rfqSubmissionSchema } from "@/lib/zod/rfq";
import { sendConfirmationEmail, sendNotificationEmail } from "@/lib/email";

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(ip: string, storeId: string): boolean {
  const key = `${ip}:${storeId}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { storeId: true },
    });

    if (!user?.storeId) {
      return NextResponse.json(
        { error: "User does not have a store" },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      storeId: user.storeId,
      deletedAt: null,
    };

    const validStatuses = ["PENDING", "QUOTED", "ACCEPTED", "CLOSED"];
    if (status && status !== "all" && status !== "null" && status !== "undefined") {
      if (validStatuses.includes(status)) {
        where.status = status;
      }
    }

    if (query) {
      where.OR = [
        { id: { contains: query, mode: "insensitive" } },
        { customerName: { contains: query, mode: "insensitive" } },
        { customerEmail: { contains: query, mode: "insensitive" } },
        { companyName: { contains: query, mode: "insensitive" } },
      ];
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        customerName: true,
        companyName: true,
        total: true,
        status: true,
        customerEmail: true,
      },
    });

    return NextResponse.json(rfqs);
  } catch (error) {
    console.error("RFQ fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Internal server error", message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const body = await request.json();

    const validation = rfqSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { storeId, customerName, customerEmail, companyName, phone, shippingDetails, additionalCustomerData, products } = validation.data;

    if (!checkRateLimit(ip, storeId)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { emailSettings: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const subtotal = products.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = subtotal * (store.taxPercent / 100);

    const countryCode = shippingDetails?.country;
    let shipping = 0;

    if (countryCode) {
      const shippingRule = await prisma.shippingRule.findFirst({
        where: {
          storeId,
          deletedAt: null,
          OR: [
            { countryCode },
            { isDefault: true },
          ],
        },
        orderBy: {
          countryCode: "desc",
        },
      });
      if (shippingRule) {
        shipping = shippingRule.flatRate;
      }
    } else {
      const defaultRule = await prisma.shippingRule.findFirst({
        where: {
          storeId,
          isDefault: true,
          deletedAt: null,
        },
      });
      if (defaultRule) {
        shipping = defaultRule.flatRate;
      }
    }

    const total = subtotal + tax + shipping;

    const rfq = await prisma.rFQ.create({
      data: {
        storeId,
        customerName,
        customerEmail,
        companyName,
        phone,
        addressCity: shippingDetails?.city,
        addressCountry: shippingDetails?.country,
        addressPostal: shippingDetails?.postal,
        addressState: shippingDetails?.state,
        addressLines: (shippingDetails?.line1 || shippingDetails?.line2
          ? { line1: shippingDetails.line1, line2: shippingDetails.line2 }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : {}) as any,
        additionalCustomerData: additionalCustomerData || {},
        rawPayload: body,
        subtotal,
        tax,
        shipping,
        total,
        items: {
          create: products.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.unitPrice * item.quantity,
            additionalData: item.additionalData || {},
          })),
        },
      },
      include: { items: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rfqWithItems = rfq as any;

    const confirmationResult = await sendConfirmationEmail(
      rfqWithItems,
      store.emailSettings,
      store.name
    );

    await sendNotificationEmail(
      rfqWithItems,
      store.emailSettings,
      store.name
    );

    await prisma.rFQ.update({
      where: { id: rfq.id },
      data: {
        confirmationEmailStatus: confirmationResult.success ? "SENT" : "FAILED",
      },
    });

    return NextResponse.json({ message: "success", rfqId: rfq.id });
  } catch (error) {
    console.error("RFQ submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
