import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
) {
    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        userId,
        email
    } = await verifyJsonWebtoken(cookie) as unknown as {
        userId: string
        email: string
    };

    if (!userId || !email) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            balance: true,
        }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}
