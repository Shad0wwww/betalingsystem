import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

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
