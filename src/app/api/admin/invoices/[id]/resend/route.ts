import { sendEmail } from "@/lib/emailer/Mail";
import { generateInvoiceEmailContent } from "@/lib/emailer/MailCreatorInvoice";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { ActionType, Role } from "@prisma/client";
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const payload = await requireAdmin(req);
    if (!payload) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

    // amount is stored in øre — convert to DKK for the email template
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
            userId: (payload as any).userId,
            action: ActionType.ADMIN_ACTION,
            details: `Admin gensendte faktura #${invoiceId} (${invoice.InvoiceNumber}) til ${invoice.user.email}`,
        },
    });

    return NextResponse.json({ ok: true });
}
