import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [total, allUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
    ]);

    const data = allUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone,
        role: user.role,
        reservedBalance: user.reservedBalance,
        phoneCountry: user.phoneCountry || "N/A",
        timestamp: new Date(user.createdAt).toLocaleDateString("da-DK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
    }));

    return NextResponse.json({ data, total, page, limit });
}
