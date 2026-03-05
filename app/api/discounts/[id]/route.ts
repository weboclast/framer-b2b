import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateDiscountSchema = z.object({
    code: z.string().min(1).max(50).toUpperCase().optional(),
    type: z.enum(["PERCENT", "FIXED"]).optional(),
    value: z.number().positive().optional(),
    minSubtotal: z.number().min(0).optional(),
    active: z.boolean().optional(),
});

async function getStoreId(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { storeId: true },
    });
    return user?.storeId ?? null;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validation = updateDiscountSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const storeId = await getStoreId(session.user.email);
        if (!storeId) return NextResponse.json({ error: "No store" }, { status: 403 });

        const discount = await prisma.discount.findUnique({ where: { id } });
        if (!discount || discount.storeId !== storeId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const updated = await prisma.discount.update({
            where: { id },
            data: validation.data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Discount PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const storeId = await getStoreId(session.user.email);
        if (!storeId) return NextResponse.json({ error: "No store" }, { status: 403 });

        const discount = await prisma.discount.findUnique({ where: { id } });
        if (!discount || discount.storeId !== storeId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.discount.delete({ where: { id } });
        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("Discount DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
