import { cookies } from "next/headers";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import { fetchInvoiceFile } from "@/lib/cloudflare/FetchInvoice";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Receipt } from "lucide-react";
import InvoiceFrame from "./InvoiceFrame";

interface KvitteringPageProps {
    params: Promise<{
        kvitteringId: string
        lang: string
    }>
}

export default async function KvitteringPage({ params }: KvitteringPageProps) {
    const { kvitteringId, lang } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) redirect(`/${lang}/login`);

    const payload = await verifyJsonWebtoken(token);
    if (!payload || typeof payload === "string") redirect(`/${lang}/login`);

    const userId = (payload as any).userId || (payload as any).id;

    const invoice = await prisma.invoice.findFirst({
        where: {
            InvoiceNumber: kvitteringId,
            ...(payload.role !== Role.ADMIN && { userId }),
        },
    });

    if (!invoice) redirect(`/${lang}/dashboard`);

    let file;
    try {
        file = await fetchInvoiceFile(kvitteringId);
    } catch {
        // Fallback: older invoices were stored under the paymentIntentId
        if (invoice.stripePaymentIntentId) {
            file = await fetchInvoiceFile(invoice.stripePaymentIntentId);
        } else {
            throw new Error("Kvittering ikke fundet");
        }
    }
    const html = await (file.Body as any)?.transformToString("utf-8") ?? "";

    return (
        <div className="relative min-h-screen bg-[#0d0d0d] overflow-x-hidden">

            {/* Background grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                    backgroundSize: "80px 80px",
                    maskImage: "radial-gradient(ellipse 85% 85% at 50% 20%, black 30%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 20%, black 30%, transparent 100%)",
                }}
            />

            {/* Blur blobs */}
            <div aria-hidden="true" className="pointer-events-none absolute top-0 -left-[10%] w-[420px] h-[420px] rounded-full z-0 opacity-40"
                style={{ background: "rgba(59,130,246,0.22)", filter: "blur(110px)" }} />
            <div aria-hidden="true" className="pointer-events-none absolute top-[10%] -right-[8%] w-[360px] h-[360px] rounded-full z-0 opacity-30"
                style={{ background: "rgba(8,81,218,0.18)", filter: "blur(110px)" }} />

            <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-10">

                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href={`/${lang}/dashboard/historik`}
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors duration-150"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tilbage
                    </Link>
                    <a
                        href={`/api/kvittering/${kvitteringId}`}
                        download={`${kvitteringId}.html`}
                        className="inline-flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-150 shadow-[0_0_16px_rgba(59,130,246,0.25)]"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </a>
                </div>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">
                        <Receipt className="w-3.5 h-3.5" />
                        Kvittering
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {kvitteringId}
                    </h1>
                </div>

                {/* Invoice iframe */}
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.06)]">
                    <InvoiceFrame html={html} />
                </div>

            </div>
        </div>
    );
}