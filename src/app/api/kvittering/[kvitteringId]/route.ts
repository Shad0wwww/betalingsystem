import { fetchInvoiceFile } from "@/lib/cloudflare/FetchInvoice";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: { params: Promise<{ kvitteringId: string }> }) {
    const { kvitteringId } = await params;

    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!kvitteringId) {
        return NextResponse.json({ error: "Kvittering ID is required" }, { status: 400 });
    }

    const payload = await verifyJsonWebtoken(cookie);
    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = (payload as any).userId || (payload as any).id;

    if (!userId) {
        return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const hasAccess = await isKvitteringAccessibleByUser(kvitteringId, userId);

    if (!hasAccess && payload.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fetchedInvoice = await fetchInvoiceFile(kvitteringId);

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
