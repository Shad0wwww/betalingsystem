import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Returns the user's current active meter session (if any)
export async function GET(req: NextRequest) {
    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(cookie);
    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = (payload as any).userId || (payload as any).id;

    const session = await prisma.meterSession.findFirst({
        where: { userId, isActive: true },
        include: {
            meter: { select: { deviceId: true, location: true, type: true } },
            boat: { select: { kaldeNavn: true, skibModel: true } },
        },
        orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ session: session ?? null });
}
