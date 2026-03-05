import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const emailSettingsSchema = z.object({
    senderAddress: z.string().email().optional().nullable(),
    replyTo: z.string().email().optional().nullable(),
    internalRecipient: z.string().email().optional().nullable(),
    confirmationSubject: z.string().optional().nullable(),
    confirmationBody: z.string().optional().nullable(),
    notificationSubject: z.string().optional().nullable(),
    notificationBody: z.string().optional().nullable(),
    quoteSubject: z.string().optional().nullable(),
    quoteBody: z.string().optional().nullable(),
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
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const emailSettings = await prisma.emailSettings.findUnique({
            where: { storeId: user.storeId },
        });

        // Return empty defaults if not configured yet
        return NextResponse.json(
            emailSettings || {
                senderAddress: null,
                replyTo: null,
                internalRecipient: null,
                confirmationSubject: null,
                confirmationBody: null,
                notificationSubject: null,
                notificationBody: null,
                quoteSubject: null,
                quoteBody: null,
            }
        );
    } catch (error) {
        console.error("Settings email GET error:", error);
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
        const validation = emailSettingsSchema.safeParse(body);
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

        const updated = await prisma.emailSettings.upsert({
            where: { storeId: user.storeId },
            create: { storeId: user.storeId, ...validation.data },
            update: validation.data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Settings email PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
