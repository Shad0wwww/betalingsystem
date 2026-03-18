import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { InvoiceStatus, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { searchParams } = req.nextUrl;
    const format = searchParams.get("format");
    const statusParam = searchParams.get("status") as InvoiceStatus | null;
    const typeParam = searchParams.get("type") as UtilityType | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (statusParam && Object.values(InvoiceStatus).includes(statusParam)) where.status = statusParam;
    if (typeParam && Object.values(UtilityType).includes(typeParam)) where.type = typeParam;
    if (from || to) {
        where.createdAt = {};
        if (from) (where.createdAt as any).gte = new Date(from);
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            (where.createdAt as any).lte = toDate;
        }
    }

    const isExport = format === "csv";

    const [total, invoices, paidAggregate] = await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: isExport ? 0 : skip,
            take: isExport ? 10000 : limit,
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
                user: { select: { id: true, name: true, email: true } },
            },
        }),
        prisma.invoice.aggregate({
            where: { ...where, status: InvoiceStatus.PAID },
            _sum: { amount: true },
        }),
    ]);

    const paidTotalKr = ((paidAggregate._sum.amount ?? 0) / 100).toFixed(2);

    const rows = invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.InvoiceNumber ?? "",
        userName: inv.user.name,
        userEmail: inv.user.email,
        userId: inv.user.id,
        amountKr: (inv.amount / 100).toFixed(2),
        currency: inv.currency.toUpperCase(),
        status: inv.status,
        type: inv.type,
        createdAt: inv.createdAt.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        paidAt: inv.paidAt?.toISOString() ?? "",
    }));

    if (isExport) {
        const headers = ["ID", "Fakturanummer", "Navn", "Email", "BrugerID", "Beløb (kr)", "Valuta", "Status", "Type", "Oprettet", "Forfald", "Betalt"];
        const csvRows = [
            "\uFEFF" + headers.join(";"),
            ...rows.map((r) => [
                r.id,
                `"${r.invoiceNumber.replace(/"/g, '""')}"`,
                `"${r.userName.replace(/"/g, '""')}"`,
                `"${r.userEmail.replace(/"/g, '""')}"`,
                r.userId,
                r.amountKr.replace(".", ","),
                r.currency,
                r.status,
                r.type,
                r.createdAt,
                r.dueDate,
                r.paidAt,
            ].join(";")),
        ];
        return new NextResponse(csvRows.join("\r\n"), {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="bogfoering-${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        });
    }

    return NextResponse.json({ data: rows, total, page, limit, paidTotalKr });
}
