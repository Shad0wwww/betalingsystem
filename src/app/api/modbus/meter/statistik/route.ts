import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { MeterStatus, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
    req: NextRequest
) {
    const authToken =
        req.headers.get("authorization")?.replace("Bearer ", "") ??
        req.cookies.get("auth_token")?.value;

    if (!authToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(authToken);

    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!GetUser.doesUserExistByEmail(payload.email)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ((payload as any).role !== Role.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const aktivemeters = await prisma.meter.count({
        select: {
            _all: true,
        },
        where: {
            status: MeterStatus.ONLINE,
        },
    });

    const totalMeters = await prisma.meter.count();

    return NextResponse.json({ activeMeters: aktivemeters._all, totalMeters: totalMeters });

}