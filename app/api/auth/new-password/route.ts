import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { password, token } = await request.json();

        if (!password || !token) {
            return NextResponse.json({ error: "Password and token are required" }, { status: 400 });
        }

        const existingToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        if (!existingToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            return NextResponse.json({ error: "Token has expired" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: existingToken.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("New password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
