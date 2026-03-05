import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const validateSchema = z.object({
    storeId: z.string().min(1),
    code: z.string().min(1),
    cartSubtotal: z.number().min(0),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = validateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { storeId, code, cartSubtotal } = validation.data;

        const discount = await prisma.discount.findUnique({
            where: { storeId_code: { storeId, code: code.toUpperCase() } },
        });

        if (!discount || !discount.active) {
            return NextResponse.json({ valid: false, message: "Invalid or inactive discount code" });
        }

        if (cartSubtotal < discount.minSubtotal) {
            return NextResponse.json({
                valid: false,
                message: `Minimum order of $${discount.minSubtotal.toFixed(2)} required for this code`,
            });
        }

        const discountAmount =
            discount.type === "PERCENT"
                ? (cartSubtotal * discount.value) / 100
                : Math.min(discount.value, cartSubtotal);

        return NextResponse.json({
            valid: true,
            discountAmount: Math.round(discountAmount * 100) / 100,
            type: discount.type,
            value: discount.value,
        });
    } catch (error) {
        console.error("Discount validate error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
