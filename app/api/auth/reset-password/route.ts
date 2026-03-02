import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Return success even if user doesn't exist for security reasons
            return NextResponse.json({ success: true });
        }

        const token = await generatePasswordResetToken(email);
        await sendPasswordResetEmail(token.email, token.token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
