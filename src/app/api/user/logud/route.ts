import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
) {
    const cookie = req.cookies.get("auth_token")?.value;

    console.log("Received logout request with token:", cookie);

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Verifying token for logout:", cookie);

    const payload = await verifyJsonWebtoken(cookie);

    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("Token verified successfully for logout:", payload);

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    return response;
}