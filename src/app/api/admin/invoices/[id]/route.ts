import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType, InvoiceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { id } = await params;
    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) return NextResponse.json({ error: "Ugyldigt faktura-ID" }, { status: 400 });

    const body = await req.json();
    const status: InvoiceStatus = body.status;
    if (!status || !Object.values(InvoiceStatus).includes(status)) {
        return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return NextResponse.json({ error: "Faktura ikke fundet" }, { status: 404 });

    const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status,
            paidAt: status === InvoiceStatus.PAID && !invoice.paidAt ? new Date() : invoice.paidAt,
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: result.user.userId,
            action: ActionType.ADMIN_ACTION,
            details: `Admin ændrede faktura #${invoiceId} status fra ${invoice.status} til ${status}`,
        },
    });

    return NextResponse.json({ invoice: updated });
}
