import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [total, allLogs] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
    ]);

    const data = allLogs.map((user) => ({
        id: user.id,
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

    console.log("Fetched users:", data);

    return NextResponse.json({ data, total, page, limit });
    
}
