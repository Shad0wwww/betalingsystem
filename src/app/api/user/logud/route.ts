import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
) {
    const cookie = req.cookies.get("auth_token")?.value;


    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(cookie);

    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await prisma.auditLog.create({
        data: {
            userId: (payload as any).userId || (payload as any).id,
            action: ActionType.LOGOUT,
            details: "User logged out"
        }
    });

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    



    
    return response;
}