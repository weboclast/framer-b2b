import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { storeId: true, role: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isSuperAdmin = (user.role as string) === "SUPER_ADMIN";

        if (!user.storeId && !isSuperAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const where: Prisma.RFQWhereInput = {
            storeId: !isSuperAdmin ? (user.storeId as string) : undefined,
            deletedAt: null,
        };

        const [totalRfqs, pendingRfqs, acceptedRfqs, customersCount] = await Promise.all([
            prisma.rFQ.count({ where }),
            prisma.rFQ.count({ where: { ...where, status: "PENDING" } }),
            prisma.rFQ.aggregate({
                where: { ...where, status: "ACCEPTED" },
                _sum: { total: true },
            }),
            prisma.rFQ.groupBy({
                by: ["customerEmail"],
                where,
            }).then(res => res.length),
        ]);

        return NextResponse.json({
            totalRfqs,
            pendingRfqs,
            balance: acceptedRfqs._sum?.total || 0,
            customersCount,
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
