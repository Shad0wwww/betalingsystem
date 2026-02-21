import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(
    req: NextRequest
) {
    const cookie = req.cookies.get("auth_token")?.value;


    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Verifying token for logout:", cookie);

    const payload = await verifyJsonWebtoken(cookie);

    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
        where: { email: payload.email }
    });

    return NextResponse.json({ message: "User deleted successfully" });
}