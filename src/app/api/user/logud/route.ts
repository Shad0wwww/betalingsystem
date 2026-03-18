import { validateSession, deleteSession, SESSION_COOKIE_NAME } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await validateSession(sessionToken);

    if (!user) {
        const response = NextResponse.json({ error: "Invalid session" }, { status: 401 });
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
    }

    // Slet session fra database
    await deleteSession(sessionToken);

    await prisma.auditLog.create({
        data: {
            userId: user.userId,
            action: ActionType.LOGOUT,
            details: "User logged out",
        },
    });

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
}
