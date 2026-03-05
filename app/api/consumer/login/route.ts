import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "consumer-secret");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        const consumer = await prisma.consumerUser.findUnique({ where: { email } });
        if (!consumer || !consumer.password) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const isValid = await compare(password, consumer.password);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const token = await new SignJWT({
            sub: consumer.id,
            email: consumer.email,
            name: consumer.name,
            type: "consumer",
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(secret);

        const response = NextResponse.json({
            id: consumer.id,
            email: consumer.email,
            name: consumer.name,
        });

        response.cookies.set("consumer-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Consumer login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
