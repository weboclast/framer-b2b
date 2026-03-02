import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { storeId: true },
        });

        if (!user?.storeId) {
            return NextResponse.json(
                { error: "User does not have a store" },
                { status: 403 }
            );
        }

        const rfq = await prisma.rFQ.findUnique({
            where: { id },
            include: {
                items: true,
                statusHistory: {
                    orderBy: { changedAt: "desc" },
                },
                quoteNotes: {
                    orderBy: { sentAt: "desc" },
                },
            },
        });

        if (!rfq) {
            return NextResponse.json(
                { error: "RFQ not found" },
                { status: 404 }
            );
        }

        if (rfq.storeId !== user.storeId) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        return NextResponse.json(rfq);
    } catch (error) {
        console.error("RFQ detail fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
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
        const { status, note } = await request.json();

        const validStatuses = ["PENDING", "QUOTED", "ACCEPTED", "CLOSED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { storeId: true },
        });

        const rfq = await prisma.rFQ.findUnique({ where: { id } });
        if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (rfq.storeId !== user?.storeId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedRfq = await prisma.rFQ.update({
            where: { id },
            data: {
                status,
                statusHistory: {
                    create: {
                        status,
                        note: note || `Status updated to ${status}`,
                        changedBy: session.user.email,
                    },
                },
            },
            include: {
                items: true,
                statusHistory: {
                    orderBy: { changedAt: "desc" },
                },
                quoteNotes: {
                    orderBy: { sentAt: "desc" },
                },
            },
        });

        return NextResponse.json(updatedRfq);
    } catch (error) {
        console.error("RFQ status update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
