import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin(req: NextRequest) {
    const authToken =
        req.headers.get("authorization")?.replace("Bearer ", "") ??
        req.cookies.get("auth_token")?.value;
    if (!authToken) return null;
    const payload = await verifyJsonWebtoken(authToken);
    if (!payload || typeof payload === "string") return null;
    if (!GetUser.doesUserExistByEmail(payload.email)) return null;
    if ((payload as any).role !== Role.ADMIN) return null;
    return payload;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const payload = await requireAdmin(req);
    if (!payload) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [total, invoices] = await Promise.all([
        prisma.invoice.count({ where: { userId: id } }),
        prisma.invoice.findMany({
            where: { userId: id },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
                id: true,
                InvoiceNumber: true,
                amount: true,
                currency: true,
                status: true,
                type: true,
                dueDate: true,
                paidAt: true,
                createdAt: true,
                stripePaymentIntentId: true,
            },
        }),
    ]);

    return NextResponse.json({ data: invoices, total, page, limit });
}
