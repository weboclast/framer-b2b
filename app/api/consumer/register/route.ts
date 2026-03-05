import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { name, email, password } = validation.data;

        const existing = await prisma.consumerUser.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const hashed = await hash(password, 12);
        const consumer = await prisma.consumerUser.create({
            data: { name, email, password: hashed },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        return NextResponse.json(consumer, { status: 201 });
    } catch (error) {
        console.error("Consumer register error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
