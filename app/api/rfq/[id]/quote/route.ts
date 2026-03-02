import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rfqQuoteSchema } from "@/lib/zod/rfq";
import { sendQuoteEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validation = rfqQuoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true },
    });

    if (!user?.storeId) {
      return NextResponse.json(
        { error: "User does not have a store" },
        { status: 403 }
      );
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        items: true,
        store: {
          include: { emailSettings: true },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    if (rfq.storeId !== user.storeId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { messageBody } = validation.data;

    const quoteResult = await sendQuoteEmail(
      rfq,
      rfq.store.emailSettings,
      rfq.store.name,
      messageBody
    );

    await prisma.$transaction([
      prisma.rFQ.update({
        where: { id },
        data: { status: "QUOTED" },
      }),
      prisma.quoteNote.create({
        data: {
          rfqId: id,
          messageBody,
          sentBy: user.email,
          emailStatus: quoteResult.success ? "SENT" : "FAILED",
        },
      }),
      prisma.statusHistory.create({
        data: {
          rfqId: id,
          status: "QUOTED",
          note: "Quote sent to customer",
          changedBy: user.email,
        },
      }),
    ]);

    return NextResponse.json({
      message: "success",
      emailStatus: quoteResult.success ? "sent" : "failed",
    });
  } catch (error) {
    console.error("Quote send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
