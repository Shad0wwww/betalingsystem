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
} from "lucide-react";
import { Role } from "@prisma/client";

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
                </div>
            )}
        </div>
    );
}
