import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";



export async function POST(
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

    if (!GetUser.doesUserExistById((payload as any).userId || (payload as any).id)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const userId = (payload as any).userId || (payload as any).id;

    await prisma.user.update({
        where: { id: userId },
        data: { name },
    });

    await prisma.auditLog.create({
        data: {
            userId: userId,
            action: ActionType.NAME_CHANGE,
            details: `User changed name to ${name}`
        }
    });

    return NextResponse.json({ message: "Name updated successfully!", status: 200 });
}