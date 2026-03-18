import { sendEmail } from "@/lib/emailer/Mail";
import { generateInvoiceEmailContent } from "@/lib/emailer/MailCreatorInvoice";
import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { id } = await params;
    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) return NextResponse.json({ error: "Ugyldigt faktura-ID" }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: { select: { email: true, name: true } } },
    });

    if (!invoice) return NextResponse.json({ error: "Faktura ikke fundet" }, { status: 404 });
    if (!invoice.InvoiceNumber) {
        return NextResponse.json(
            { error: "Faktura har endnu ikke et fakturanummer og kan ikke gensendes" },
            { status: 400 },
        );
    }

    const amountDkk = invoice.amount / 100;

    const html = await generateInvoiceEmailContent(
        amountDkk,
        invoice.type,
        invoice.user.email,
        invoice.paidAt ?? invoice.createdAt,
        invoice.InvoiceNumber,
    );

    await sendEmail(invoice.user.email, `Faktura ${invoice.InvoiceNumber}`, html);

    await prisma.auditLog.create({
        data: {
            userId: result.user.userId,
            action: ActionType.ADMIN_ACTION,
            details: `Admin gensendte faktura #${invoiceId} (${invoice.InvoiceNumber}) til ${invoice.user.email}`,
        },
    });

    return NextResponse.json({ ok: true });
}
