import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "consumer-secret");

async function getConsumerFromRequest(request: NextRequest) {
    const token = request.cookies.get("consumer-token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secret);
        if (payload.type !== "consumer" || !payload.sub) return null;
        return { id: payload.sub as string, email: payload.email as string };
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const consumer = await getConsumerFromRequest(request);
        if (!consumer) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const skip = parseInt(searchParams.get("skip") || "0");
        const take = parseInt(searchParams.get("take") || "20");

        const [rfqs, total] = await Promise.all([
            prisma.rFQ.findMany({
                where: { consumerUserId: consumer.id, deletedAt: null },
                select: {
                    id: true,
                    status: true,
                    total: true,
                    createdAt: true,
                    customerName: true,
                    companyName: true,
                    store: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.rFQ.count({ where: { consumerUserId: consumer.id, deletedAt: null } }),
        ]);

        return NextResponse.json({ rfqs, total, skip, take });
    } catch (error) {
        console.error("Consumer RFQs GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
