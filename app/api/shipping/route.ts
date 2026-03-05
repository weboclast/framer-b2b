import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createShippingRuleSchema = z.object({
    countryCode: z.string().length(2).toUpperCase().optional().nullable(),
    flatRate: z.number().min(0),
    isDefault: z.boolean().optional().default(false),
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { storeId: true },
        });

        if (!user?.storeId) {
            return NextResponse.json({ error: "User does not have a store" }, { status: 403 });
        }

        const rules = await prisma.shippingRule.findMany({
            where: { storeId: user.storeId, deletedAt: null },
            orderBy: [{ isDefault: "desc" }, { countryCode: "asc" }],
        });

        return NextResponse.json(rules);
    } catch (error) {
        console.error("Shipping GET error:", error);
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
        const validation = createShippingRuleSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { storeId: true },
        });

        if (!user?.storeId) {
            return NextResponse.json({ error: "User does not have a store" }, { status: 403 });
        }

        // If setting isDefault, clear other defaults first
        if (validation.data.isDefault) {
            await prisma.shippingRule.updateMany({
                where: { storeId: user.storeId, deletedAt: null, isDefault: true },
                data: { isDefault: false },
            });
        }

        const rule = await prisma.shippingRule.create({
            data: {
                storeId: user.storeId,
                countryCode: validation.data.countryCode || null,
                flatRate: validation.data.flatRate,
                isDefault: validation.data.isDefault,
            },
        });

        return NextResponse.json(rule, { status: 201 });
    } catch (error) {
        console.error("Shipping POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
