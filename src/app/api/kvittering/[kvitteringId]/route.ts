import { fetchInvoiceFile } from "@/lib/cloudflare/FetchInvoice";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ kvitteringId: string }> }) {
    const { kvitteringId } = await params;

    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!kvitteringId) {
        return NextResponse.json({ error: "Kvittering ID is required" }, { status: 400 });
    }

    const user = await validateSession(sessionToken);
    if (!user) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const hasAccess = await isKvitteringAccessibleByUser(kvitteringId, user.userId);

    if (!hasAccess && user.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let fetchedInvoice;
    try {
        fetchedInvoice = await fetchInvoiceFile(kvitteringId);
    } catch {
        // Fallback: older invoices were stored under the paymentIntentId
        const dbInvoice = await prisma.invoice.findFirst({
            where: { InvoiceNumber: kvitteringId },
            select: { stripePaymentIntentId: true },
        });
        if (dbInvoice?.stripePaymentIntentId) {
            try {
                fetchedInvoice = await fetchInvoiceFile(dbInvoice.stripePaymentIntentId);
            } catch {
                fetchedInvoice = null;
            }
        }
    }

    if (!fetchedInvoice) {
        return NextResponse.json({ error: "Kvittering not found" }, { status: 404 });
    }

    const invoiceStream = fetchedInvoice.Body as ReadableStream;

    return new Response(invoiceStream, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": `attachment; filename="${kvitteringId}.html"`,
        },
    });
}

async function isKvitteringAccessibleByUser(
    kvitteringId: string, userId: string
): Promise<boolean> {
    const invoice = await prisma.invoice.findFirst({
        where: {
            InvoiceNumber: kvitteringId,
            userId,
        },
    });
    return !!invoice;
}
