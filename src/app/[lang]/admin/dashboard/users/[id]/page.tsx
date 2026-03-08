"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@/components/admin/Box";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    CreditCard,
    Anchor,
    FileText,
    Activity,
    Zap,
    ClipboardList,
    Save,
    Loader2,
    Receipt,
    Send,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Role } from "@prisma/client";

type InvoiceStatus = "PENDING" | "PAID" | "FAILED" | "OVERDUE";
type UtilityType = "ELECTRICITY" | "WATER";

interface InvoiceRow {
    id: number;
    InvoiceNumber: string | null;
    amount: number;
    currency: string;
    status: InvoiceStatus;
    type: UtilityType;
    dueDate: string;
    paidAt: string | null;
    createdAt: string;
}

const INV_STATUS_LABELS: Record<InvoiceStatus, string> = {
    PENDING: "Afventer",
    PAID: "Betalt",
    FAILED: "Fejlet",
    OVERDUE: "Overskredet",
};

const INV_STATUS_COLORS: Record<InvoiceStatus, string> = {
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    OVERDUE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

interface UserDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    phoneCountry: string;
    role: Role;
    reservedBalance: number;
    stripeCustomerId: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        boats: number;
        invoices: number;
        transactions: number;
        meterSessions: number;
        auditLogs: number;
    };
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 shrink-0">
                <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
                <p className="text-xs text-zinc-500 font-medium">{label}</p>
                <p className="text-lg font-bold text-white leading-tight">{value}</p>
            </div>
        </div>
    );
}

function Field({
    label,
    icon: Icon,
    children,
}: {
    label: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            {children}
        </div>
    );
}

const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const selectClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export default function AdminUserDetailPage() {
    const { id, lang } = useParams<{ id: string; lang: string }>();
    const router = useRouter();

    const [user, setUser] = React.useState<UserDetail | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Form state
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [phoneCountry, setPhoneCountry] = React.useState("");
    const [role, setRole] = React.useState<Role>(Role.USER);
    const [saving, setSaving] = React.useState(false);
    const [saveError, setSaveError] = React.useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = React.useState(false);

    // Invoices
    const [invoices, setInvoices] = React.useState<InvoiceRow[]>([]);
    const [invoicesLoading, setInvoicesLoading] = React.useState(true);
    const [invoicesTotal, setInvoicesTotal] = React.useState(0);
    const [invoicesPage, setInvoicesPage] = React.useState(1);
    const [resendingId, setResendingId] = React.useState<number | null>(null);
    const [resendMsg, setResendMsg] = React.useState<{ id: number; ok: boolean; text: string } | null>(null);
    const INVOICE_LIMIT = 20;

    React.useEffect(() => {
        fetch(`/api/admin/users/${id}`, { credentials: "include" })
            .then((r) => {
                if (!r.ok) throw new Error(`Fejl: ${r.status}`);
                return r.json();
            })
            .then(({ user }) => {
                setUser(user);
                setName(user.name);
                setEmail(user.email);
                setPhone(user.phone);
                setPhoneCountry(user.phoneCountry);
                setRole(user.role);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const fetchInvoices = React.useCallback(
        async (p: number) => {
            setInvoicesLoading(true);
            try {
                const res = await fetch(
                    `/api/admin/users/${id}/invoices?page=${p}&limit=${INVOICE_LIMIT}`,
                    { credentials: "include" },
                );
                if (!res.ok) throw new Error();
                const json = await res.json();
                setInvoices(json.data);
                setInvoicesTotal(json.total);
                setInvoicesPage(p);
            } finally {
                setInvoicesLoading(false);
            }
        },
        [id, INVOICE_LIMIT],
    );

    React.useEffect(() => {
        fetchInvoices(1);
    }, [fetchInvoices]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError(null);
        setSaveSuccess(false);
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, email, phone, phoneCountry, role }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Der skete en fejl");

            setUser((prev) => prev ? { ...prev, ...data.user } : prev);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (invoiceId: number, newStatus: InvoiceStatus) => {
        const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            setInvoices((prev) =>
                prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv)),
            );
        }
    };

    const handleResend = async (invoiceId: number) => {
        setResendingId(invoiceId);
        setResendMsg(null);
        try {
            const res = await fetch(`/api/admin/invoices/${invoiceId}/resend`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setResendMsg({ id: invoiceId, ok: true, text: "Kvittering sendt" });
            } else {
                setResendMsg({ id: invoiceId, ok: false, text: data.error ?? "Fejl" });
            }
        } finally {
            setResendingId(null);
            setTimeout(() => setResendMsg(null), 4000);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <button
                    onClick={() => router.push(`/${lang}/admin/dashboard/users`)}
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-5 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Tilbage til brugere
                </button>

                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Admin
                    </span>
                </div>

                {loading ? (
                    <div className="h-8 w-48 rounded-md animate-pulse bg-zinc-800/60 mt-1" />
                ) : (
                    <div>
                        <h1 className="text-2xl font-bold text-white">{user?.name ?? "—"}</h1>
                        <p className="text-zinc-500 text-sm mt-1 font-mono">{user?.id}</p>
                    </div>
                )}
            </div>

            {error ? (
                <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                </div>
            ) : (
                <div className="mx-auto max-w-screen-xl px-4 md:px-20 space-y-6">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <StatCard label="Både" value={user?._count.boats ?? 0} icon={Anchor} />
                        <StatCard label="Fakturaer" value={user?._count.invoices ?? 0} icon={FileText} />
                        <StatCard label="Transaktioner" value={user?._count.transactions ?? 0} icon={Activity} />
                        <StatCard label="Sessioner" value={user?._count.meterSessions ?? 0} icon={Zap} />
                        <StatCard label="Audit logs" value={user?._count.auditLogs ?? 0} icon={ClipboardList} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Edit form */}
                        <div className="lg:col-span-2">
                            <Box>
                                <div className="mb-5">
                                    <h2 className="text-base font-semibold text-white">Rediger bruger</h2>
                                    <p className="text-zinc-500 text-sm mt-0.5">Ændringer gemmes med det samme.</p>
                                </div>

                                <form onSubmit={handleSave} className="space-y-4">
                                    <Field label="Navn" icon={User}>
                                        <input
                                            className={inputClass}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={saving || loading}
                                            placeholder="Fulde navn"
                                        />
                                    </Field>

                                    <Field label="Email" icon={Mail}>
                                        <input
                                            className={inputClass}
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={saving || loading}
                                            placeholder="email@eksempel.dk"
                                        />
                                    </Field>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-1">
                                            <Field label="Land" icon={Phone}>
                                                <input
                                                    className={inputClass}
                                                    value={phoneCountry}
                                                    onChange={(e) => setPhoneCountry(e.target.value)}
                                                    disabled={saving || loading}
                                                    placeholder="DK"
                                                    maxLength={4}
                                                />
                                            </Field>
                                        </div>
                                        <div className="col-span-2">
                                            <Field label="Telefon" icon={Phone}>
                                                <input
                                                    className={inputClass}
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    disabled={saving || loading}
                                                    placeholder="+45 12345678"
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    <Field label="Rolle" icon={Shield}>
                                        <select
                                            className={selectClass}
                                            value={role}
                                            onChange={(e) => setRole(e.target.value as Role)}
                                            disabled={saving || loading}
                                        >
                                            <option value={Role.USER}>Bruger</option>
                                            <option value={Role.ADMIN}>Admin</option>
                                        </select>
                                    </Field>

                                    {saveError && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <p className="text-red-400 text-sm">{saveError}</p>
                                        </div>
                                    )}

                                    {saveSuccess && (
                                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <p className="text-green-400 text-sm">Ændringer gemt.</p>
                                        </div>
                                    )}

                                    <div className="pt-1">
                                        <button
                                            type="submit"
                                            disabled={saving || loading}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {saving ? "Gemmer..." : "Gem ændringer"}
                                        </button>
                                    </div>
                                </form>
                            </Box>
                        </div>

                        {/* Info sidebar */}
                        <div className="space-y-4">
                            <Box>
                                <h2 className="text-sm font-semibold text-white mb-4">Kontoinformation</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">Reserveret beløb</p>
                                        {loading ? (
                                            <div className="h-5 w-20 rounded animate-pulse bg-zinc-800" />
                                        ) : (
                                            <p className="text-white font-medium text-sm">
                                                {(user?.reservedBalance ?? 0).toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                                            </p>
                                        )}
                                    </div>
                                    <div className="h-px bg-zinc-800" />
                                    <div>
                                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">Stripe kunde-ID</p>
                                        {loading ? (
                                            <div className="h-5 w-32 rounded animate-pulse bg-zinc-800" />
                                        ) : (
                                            <p className="text-white font-mono text-xs break-all">
                                                {user?.stripeCustomerId ?? <span className="text-zinc-600 font-sans">Ikke tilknyttet</span>}
                                            </p>
                                        )}
                                    </div>
                                    <div className="h-px bg-zinc-800" />
                                    <div>
                                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Oprettet
                                        </p>
                                        {loading ? (
                                            <div className="h-5 w-28 rounded animate-pulse bg-zinc-800" />
                                        ) : (
                                            <p className="text-white text-sm">
                                                {user ? new Date(user.createdAt).toLocaleDateString("da-DK", {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                }) : "—"}
                                            </p>
                                        )}
                                    </div>
                                    <div className="h-px bg-zinc-800" />
                                    <div>
                                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5 flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" /> Sidst opdateret
                                        </p>
                                        {loading ? (
                                            <div className="h-5 w-28 rounded animate-pulse bg-zinc-800" />
                                        ) : (
                                            <p className="text-white text-sm">
                                                {user ? new Date(user.updatedAt).toLocaleDateString("da-DK", {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                }) : "—"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Box>
                        </div>
                    </div>

                    {/* ── Invoices ─────────────────────────────────────────── */}
                    <div>
                        <Box>
                            <div className="flex items-center gap-2 mb-5">
                                <Receipt className="w-4 h-4 text-blue-400" />
                                <h2 className="text-base font-semibold text-white">Fakturaer</h2>
                                <span className="ml-auto text-xs text-zinc-500">
                                    {invoicesTotal} total
                                </span>
                            </div>
                            <div className="overflow-x-auto -mx-6 px-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-left">
                                            {["ID", "Fakturanummer", "Beløb", "Type", "Status", "Oprettet", "Betalt", ""].map((h) => (
                                                <th key={h} className="pb-3 pr-3 last:pr-0 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoicesLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i} className="border-b border-zinc-800/50">
                                                    {Array.from({ length: 8 }).map((__, j) => (
                                                        <td key={j} className="py-3 pr-3">
                                                            <div className="h-4 rounded animate-pulse bg-zinc-800/60 w-16" />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : invoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-zinc-500">
                                                    Ingen fakturaer
                                                </td>
                                            </tr>
                                        ) : (
                                            invoices.map((inv) => (
                                                <tr key={inv.id} className="border-b border-zinc-800/50">
                                                    <td className="py-3 pr-3 text-zinc-400 font-mono text-xs">
                                                        {inv.id}
                                                    </td>
                                                    <td className="py-3 pr-3 text-zinc-300 font-mono text-xs">
                                                        {inv.InvoiceNumber ?? <span className="text-zinc-600">—</span>}
                                                    </td>
                                                    <td className="py-3 pr-3 text-white font-medium tabular-nums whitespace-nowrap">
                                                        {(inv.amount / 100).toLocaleString("da-DK", {
                                                            style: "currency",
                                                            currency: inv.currency.toUpperCase(),
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </td>
                                                    <td className="py-3 pr-3 text-zinc-300">
                                                        {inv.type === "ELECTRICITY" ? "El" : "Vand"}
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <select
                                                            value={inv.status}
                                                            onChange={(e) =>
                                                                handleStatusChange(inv.id, e.target.value as InvoiceStatus)
                                                            }
                                                            className={`rounded-md border px-2 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${INV_STATUS_COLORS[inv.status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
                                                        >
                                                            {(["PENDING", "PAID", "FAILED", "OVERDUE"] as InvoiceStatus[]).map((s) => (
                                                                <option key={s} value={s}>{INV_STATUS_LABELS[s]}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="py-3 pr-3 text-zinc-400 whitespace-nowrap text-xs">
                                                        {new Date(inv.createdAt).toLocaleDateString("da-DK", {
                                                            day: "2-digit", month: "2-digit", year: "numeric",
                                                        })}
                                                    </td>
                                                    <td className="py-3 pr-3 text-zinc-400 whitespace-nowrap text-xs">
                                                        {inv.paidAt
                                                            ? new Date(inv.paidAt).toLocaleDateString("da-DK", {
                                                                  day: "2-digit", month: "2-digit", year: "numeric",
                                                              })
                                                            : "—"}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <button
                                                                title={
                                                                    inv.InvoiceNumber
                                                                        ? "Gensend kvittering"
                                                                        : "Ingen fakturanummer endnu"
                                                                }
                                                                disabled={!inv.InvoiceNumber || resendingId === inv.id}
                                                                onClick={() => handleResend(inv.id)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                {resendingId === inv.id ? (
                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <Send className="w-3 h-3" />
                                                                )}
                                                                Gensend
                                                            </button>
                                                            {resendMsg?.id === inv.id && (
                                                                <span className={`text-[10px] ${resendMsg.ok ? "text-green-400" : "text-red-400"}`}>
                                                                    {resendMsg.text}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {Math.ceil(invoicesTotal / INVOICE_LIMIT) > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                                    <p className="text-xs text-zinc-500">
                                        Side {invoicesPage} af {Math.ceil(invoicesTotal / INVOICE_LIMIT)}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={invoicesPage <= 1 || invoicesLoading}
                                            onClick={() => fetchInvoices(invoicesPage - 1)}
                                            className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            disabled={invoicesPage >= Math.ceil(invoicesTotal / INVOICE_LIMIT) || invoicesLoading}
                                            onClick={() => fetchInvoices(invoicesPage + 1)}
                                            className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Box>
                    </div>
                </div>
            )}
        </div>
    );
}
