import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { ActionType, InvoiceStatus, Role } from "@prisma/client";
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const payload = await requireAdmin(req);
    if (!payload) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
            userId: (payload as any).userId,
            action: ActionType.ADMIN_ACTION,
            details: `Admin ændrede faktura #${invoiceId} status fra ${invoice.status} til ${status}`,
        },
    });

    return NextResponse.json({ invoice: updated });
}
