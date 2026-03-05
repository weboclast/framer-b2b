import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const discountSchema = z.object({
    code: z.string().min(1).max(50).toUpperCase(),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number().positive(),
    minSubtotal: z.number().min(0).default(0),
    active: z.boolean().default(true),
});

async function getStoreId(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { storeId: true },
    });
    return user?.storeId ?? null;
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const storeId = await getStoreId(session.user.email);
        if (!storeId) {
            return NextResponse.json({ error: "No store found" }, { status: 403 });
        }

        const discounts = await prisma.discount.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Discounts GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = discountSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const storeId = await getStoreId(session.user.email);
        if (!storeId) {
            return NextResponse.json({ error: "No store found" }, { status: 403 });
        }

        // Check for duplicate code in this store
        const existing = await prisma.discount.findUnique({
            where: { storeId_code: { storeId, code: validation.data.code } },
        });
        if (existing) {
            return NextResponse.json({ error: "Discount code already exists" }, { status: 409 });
        }

        const discount = await prisma.discount.create({
            data: { storeId, ...validation.data },
        });

        return NextResponse.json(discount, { status: 201 });
    } catch (error) {
        console.error("Discounts POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
