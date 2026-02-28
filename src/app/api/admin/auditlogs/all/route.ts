import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";



export async function GET(
    req: NextRequest
) {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!authToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(authToken);

    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!GetUser.doesUserExistByEmail(payload.email)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    };

    if ((payload as any).role !== Role.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allLogs = await prisma.auditLog.findMany({
        orderBy: {
            timestamp: "desc",
        },
        include: {
            user: {
                select: { email: true },
            },
        },
    });

    const formatted = allLogs.map(({ user, ...log }) => ({
        ...log,
        email: user.email,
        timestamp: new Date(log.timestamp).toLocaleDateString("da-DK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
    }));

    return NextResponse.json(formatted);


}




