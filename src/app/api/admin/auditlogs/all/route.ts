import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [total, allLogs] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.findMany({
            orderBy: { timestamp: "desc" },
            include: { user: { select: { email: true } } },
            skip,
            take: limit,
        }),
    ]);

    const data = allLogs.map(({ user, ...log }) => ({
        ...log,
        email: user.email,
        timestamp: new Date(log.timestamp).toLocaleDateString("da-DK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
    }));

    return NextResponse.json({ data, total, page, limit });
}
