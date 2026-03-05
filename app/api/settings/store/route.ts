import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const storeUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    businessLocation: z.string().optional(),
    currency: z.string().length(3).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
});

async function getVendorStore(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { storeId: true, role: true },
    });
    if (!user?.storeId) return null;
    return prisma.store.findUnique({ where: { id: user.storeId } });
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const store = await getVendorStore(session.user.email);
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        return NextResponse.json(store);
    } catch (error) {
        console.error("Settings store GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = storeUpdateSchema.safeParse(body);
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
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const updated = await prisma.store.update({
            where: { id: user.storeId },
            data: validation.data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Settings store PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
