import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { MeterStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(cookie);
    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const meters = await prisma.meter.findMany({
        where: {
            status: MeterStatus.ACTIVE,
            sessions: {
                none: { isActive: true },
            },
        },
        select: {
            id: true,
            deviceId: true,
            location: true,
            type: true,
        },
        orderBy: { id: "asc" },
    });

    return NextResponse.json({ meters });
}
