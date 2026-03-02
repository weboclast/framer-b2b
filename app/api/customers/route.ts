import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

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

        // Group RFQs by customer email to get unique customers
        // This is a common way to build a customer list if there's no dedicated Customer model
        const customersData = await prisma.rFQ.groupBy({
            by: ["customerEmail", "customerName", "companyName"],
            where: {
                storeId: user.storeId,
                deletedAt: null,
                ...(query ? {
                    OR: [
                        { customerName: { contains: query, mode: "insensitive" } },
                        { customerEmail: { contains: query, mode: "insensitive" } },
                        { companyName: { contains: query, mode: "insensitive" } },
                    ],
                } : {}),
            },
            _count: {
                id: true,
            },
            _sum: {
                total: true,
            },
            orderBy: {
                _sum: {
                    total: "desc",
                },
            },
        });

        // Transform data to a usable format that matches the Customer type in the template
        const customers = customersData.map((c, index) => {
            const email = c.customerEmail;
            const login = email.split("@")[0];

            return {
                id: index + 1,
                name: c.customerName,
                email: email,
                login: login,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.customerName)}&background=random&color=fff`,
                price: c._sum.total || 0,
                percentage: 0,
                purchased: c._count.id,
                comments: 0,
                likes: 0,
                company: c.companyName || "N/A",
            };
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error("Customers fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
