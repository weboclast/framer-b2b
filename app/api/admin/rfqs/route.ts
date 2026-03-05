import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
    try {
        const session = await requireSuperAdmin();
        if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const skip = parseInt(searchParams.get("skip") || "0");
        const take = parseInt(searchParams.get("take") || "50");
        const storeId = searchParams.get("storeId");
        const status = searchParams.get("status");
        const query = searchParams.get("query");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { deletedAt: null };
        if (storeId) where.storeId = storeId;
        if (status && ["PENDING", "QUOTED", "ACCEPTED", "CLOSED"].includes(status)) {
            where.status = status;
        }
        if (query) {
            where.OR = [
                { id: { contains: query, mode: "insensitive" } },
                { customerName: { contains: query, mode: "insensitive" } },
                { customerEmail: { contains: query, mode: "insensitive" } },
            ];
        }

        const [rfqs, total] = await Promise.all([
            prisma.rFQ.findMany({
                where,
                select: {
                    id: true,
                    createdAt: true,
                    customerName: true,
                    customerEmail: true,
                    companyName: true,
                    total: true,
                    status: true,
                    store: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.rFQ.count({ where }),
        ]);

        return NextResponse.json({ rfqs, total, skip, take });
    } catch (error) {
        console.error("Admin RFQs GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
