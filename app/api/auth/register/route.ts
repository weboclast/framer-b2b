import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "A valid email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        store: {
          create: {
            name: name ? `${name}'s Store` : "My Store",
            currency: "USD",
            taxPercent: 0,
            emailSettings: {
              create: {
                confirmationSubject: "We received your quote request",
                confirmationBody: "Hello {{customerName}}, thank you for your request for {{storeName}}. Your RFQ ID is {{rfqId}}.",
                notificationSubject: "New RFQ Received - {{rfqId}}",
                notificationBody: "New quote request from {{customerName}}. Total: ${{total}}",
                quoteSubject: "Quote for your request - {{rfqId}}",
                quoteBody: "Hello {{customerName}},\n\nHere is your quote for the products requested from {{storeName}}.\n\nTotal: ${{total}}\n\n{{customMessage}}\n\nBest regards,\n{{storeName}}",
              }
            }
          }
        }
      },
      include: {
        store: true
      }
    });

    // If User table has a separate storeId field that needs setting (due to schema design)
    if (user.store?.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { storeId: user.store.id }
      });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
