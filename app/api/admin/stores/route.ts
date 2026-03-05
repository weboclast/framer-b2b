import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

export async function GET() {
    try {
        const session = await requireSuperAdmin();
        if (!session) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const stores = await prisma.store.findMany({
            include: {
                owner: { select: { id: true, name: true, email: true, createdAt: true } },
                _count: { select: { rfqs: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(stores);
    } catch (error) {
        console.error("Admin stores GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
