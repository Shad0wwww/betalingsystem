import { validateSession, deleteAllUserSessions, SESSION_COOKIE_NAME } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await validateSession(sessionToken);

    if (!sessionUser) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.userId },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Slet alle brugerens sessions først (GDPR compliance)
    await deleteAllUserSessions(sessionUser.userId);

    await prisma.auditLog.create({
        data: {
            userId: sessionUser.userId,
            action: ActionType.ACCOUNT_DELETED,
            details: "User deleted their account",
        },
    });

    await prisma.user.delete({
        where: { id: sessionUser.userId },
    });

    const response = NextResponse.json({ message: "User deleted successfully" });
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
}
