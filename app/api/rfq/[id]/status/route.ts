import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rfqStatusUpdateSchema } from "@/lib/zod/rfq";

export async function PATCH(
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

    const validation = rfqStatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.storeId) {
      return NextResponse.json(
        { error: "User does not have a store" },
        { status: 403 }
      );
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
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

    const { status, note } = validation.data;

    await prisma.$transaction([
      prisma.rFQ.update({
        where: { id },
        data: { status },
      }),
      prisma.statusHistory.create({
        data: {
          rfqId: id,
          status,
          note: note || null,
          changedBy: user.email,
        },
      }),
    ]);

    return NextResponse.json({ message: "success", status });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
