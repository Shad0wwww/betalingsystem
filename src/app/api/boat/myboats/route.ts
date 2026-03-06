import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
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

    if (!GetUser.doesUserExistByEmail(payload.email)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = (payload as any).userId || (payload as any).id;

    const boats = await prisma.boat.findMany({
        where: {
            userId: userId
        },
        select: {
            kaldeNavn: true,
            skibModel: true,
            id: true
        }
    });

    return NextResponse.json(boats , { status: 200 });
}