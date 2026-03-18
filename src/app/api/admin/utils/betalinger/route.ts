import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [total, betalingsLog] = await Promise.all([
        prisma.transaction.count(),
        prisma.transaction.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
    ]);

    const data = betalingsLog.map(({ id, createdAt, amount }) => ({
        id,
        createdAt: new Date(createdAt).toLocaleDateString("da-DK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
        amount,
    }));

    return NextResponse.json({ data: data, total, page, limit });
}
