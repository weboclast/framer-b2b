import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateStoreSchema = z.object({
    active: z.boolean().optional(),
    name: z.string().min(1).optional(),
});

async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
    });
    if (user?.role !== "SUPER_ADMIN") return null;
    return session;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireSuperAdmin();
        if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        const body = await request.json();
        const validation = updateStoreSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const store = await prisma.store.findUnique({ where: { id } });
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        const updated = await prisma.store.update({
            where: { id },
            data: validation.data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Admin store PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
