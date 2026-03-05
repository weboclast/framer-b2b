import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateShippingRuleSchema = z.object({
    countryCode: z.string().length(2).toUpperCase().optional().nullable(),
    flatRate: z.number().min(0).optional(),
    isDefault: z.boolean().optional(),
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
        const validation = updateShippingRuleSchema.safeParse(body);
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

        const rule = await prisma.shippingRule.findUnique({ where: { id } });
        if (!rule || rule.storeId !== storeId || rule.deletedAt) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // If setting isDefault, clear other defaults first
        if (validation.data.isDefault) {
            await prisma.shippingRule.updateMany({
                where: { storeId, deletedAt: null, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        const updated = await prisma.shippingRule.update({
            where: { id },
            data: validation.data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Shipping PATCH error:", error);
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
        if (!storeId) {
            return NextResponse.json({ error: "No store found" }, { status: 403 });
        }

        const rule = await prisma.shippingRule.findUnique({ where: { id } });
        if (!rule || rule.storeId !== storeId || rule.deletedAt) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Soft delete
        await prisma.shippingRule.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("Shipping DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
