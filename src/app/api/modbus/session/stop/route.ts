import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Ends the user's active session
export async function POST(req: NextRequest) {
    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(cookie);
    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = (payload as any).userId || (payload as any).id;

    const { sessionId }: { sessionId: number } = await req.json();

    if (!sessionId) {
        return NextResponse.json({ error: "sessionId er påkrævet" }, { status: 400 });
    }

    const session = await prisma.meterSession.findFirst({
        where: { id: sessionId, userId, isActive: true },
    });

    if (!session) {
        return NextResponse.json({ error: "Aktiv session ikke fundet" }, { status: 404 });
    }

    const updated = await prisma.meterSession.update({
        where: { id: sessionId },
        data: { isActive: false, endTime: new Date() },
    });

    return NextResponse.json({ session: updated });
}
