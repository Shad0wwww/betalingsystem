"use client";

import React from "react";
import { Box } from "@/components/admin/Box";
import { Download, Filter } from "lucide-react";

type InvoiceStatus = "PENDING" | "PAID" | "FAILED" | "OVERDUE";
type UtilityType = "ELECTRICITY" | "WATER";

interface InvoiceRow {
    id: number;
    invoiceNumber: string;
    userName: string;
    userEmail: string;
    userId: string;
    amountKr: string;
    currency: string;
    status: InvoiceStatus;
    type: UtilityType;
    createdAt: string;
    dueDate: string;
    paidAt: string;
}

interface ApiResponse {
    data: InvoiceRow[];
    total: number;
    page: number;
    limit: number;
    paidTotalKr: string;
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
    PENDING: "Afventer",
    PAID: "Betalt",
    FAILED: "Fejlet",
    OVERDUE: "Overskredet",
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    OVERDUE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const TYPE_LABELS: Record<UtilityType, string> = {
    ELECTRICITY: "El",
    WATER: "Vand",
};

const inputCls =
    "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors";

const LIMIT = 50;

export default function BogforingPage() {
    const [data, setData] = React.useState<InvoiceRow[]>([]);
    const [total, setTotal] = React.useState(0);
    const [paidTotal, setPaidTotal] = React.useState("0.00");
    const [page, setPage] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [fromDate, setFromDate] = React.useState("");
    const [toDate, setToDate] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState("");

    const buildUrl = React.useCallback(
        (p: number, fmt?: string) => {
            const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
            if (fromDate) params.set("from", fromDate);
            if (toDate) params.set("to", toDate);
            if (statusFilter) params.set("status", statusFilter);
            if (typeFilter) params.set("type", typeFilter);
            if (fmt) params.set("format", fmt);
            return `/api/admin/bogforing?${params.toString()}`;
        },
        [fromDate, toDate, statusFilter, typeFilter],
    );

    const fetchData = React.useCallback(
        async (p: number) => {
            setLoading(true);
            try {
                const res = await fetch(buildUrl(p), { credentials: "include" });
                if (!res.ok) throw new Error();
                const json: ApiResponse = await res.json();
                setData(json.data);
                setTotal(json.total);
                setPaidTotal(json.paidTotalKr);
                setPage(p);
            } finally {
                setLoading(false);
            }
        },
        [buildUrl],
    );

    React.useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    const handleExport = async () => {
        const res = await fetch(buildUrl(1, "csv"), { credentials: "include" });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bogfoering-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(total / LIMIT);

    const fmt = (iso: string) =>
        iso
            ? new Date(iso).toLocaleDateString("da-DK", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
              })
            : "—";

    const resetFilters = () => {
        setFromDate("");
        setToDate("");
        setStatusFilter("");
        setTypeFilter("");
    };

    const hasFilters = fromDate || toDate || statusFilter || typeFilter;

    return (
        <div className="min-h-screen pb-12">
            {/* Page header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">Admin</span>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Bogføring</h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Rådata over fakturaer til bogføring og regnskab.
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Eksporter CSV
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-screen-xl px-4 md:px-20 space-y-4">
                {/* Filters */}
                <Box>
                    <div className="flex flex-wrap items-center gap-3">
                        <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-500 whitespace-nowrap">Fra</label>
                            <input
                                type="date"
                                className={inputCls}
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-500 whitespace-nowrap">Til</label>
                            <input
                                type="date"
                                className={inputCls}
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                        <select
                            className={inputCls}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Alle statusser</option>
                            <option value="PAID">Betalt</option>
                            <option value="PENDING">Afventer</option>
                            <option value="FAILED">Fejlet</option>
                            <option value="OVERDUE">Overskredet</option>
                        </select>
                        <select
                            className={inputCls}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Alle typer</option>
                            <option value="ELECTRICITY">El</option>
                            <option value="WATER">Vand</option>
                        </select>
                        {hasFilters && (
                            <button
                                onClick={resetFilters}
                                className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
                            >
                                Nulstil filtre
                            </button>
                        )}
                    </div>
                </Box>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Fakturaer (total)</span>
                        <span className="text-xl font-bold text-white">
                            {loading ? "—" : total.toLocaleString("da-DK")}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">
                            Omsætning (betalt i filter)
                        </span>
                        <span className="text-xl font-bold text-green-400">
                            {loading
                                ? "—"
                                : Number(paidTotal).toLocaleString("da-DK", {
                                      style: "currency",
                                      currency: "DKK",
                                      minimumFractionDigits: 2,
                                  })}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Viser</span>
                        <span className="text-xl font-bold text-white">
                            {loading ? "—" : `${data.length} / ${total}`}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <Box>
                    <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left">
                                    {[
                                        "ID",
                                        "Fakturanummer",
                                        "Bruger",
                                        "Beløb",
                                        "Type",
                                        "Status",
                                        "Oprettet",
                                        "Betalt",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="pb-3 pr-4 last:pr-0 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className="border-b border-zinc-800/50">
                                            {Array.from({ length: 8 }).map((__, j) => (
                                                <td key={j} className="py-3 pr-4">
                                                    <div className="h-4 rounded animate-pulse bg-zinc-800/60 w-20" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-zinc-500">
                                            Ingen fakturaer fundet
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                                        >
                                            <td className="py-3 pr-4 text-zinc-400 font-mono text-xs">
                                                {row.id}
                                            </td>
                                            <td className="py-3 pr-4 text-zinc-300 font-mono text-xs">
                                                {row.invoiceNumber || (
                                                    <span className="text-zinc-600">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <p className="text-white font-medium">{row.userName}</p>
                                                <p className="text-zinc-500 text-xs">{row.userEmail}</p>
                                            </td>
                                            <td className="py-3 pr-4 text-white font-medium tabular-nums whitespace-nowrap">
                                                {Number(row.amountKr).toLocaleString("da-DK", {
                                                    style: "currency",
                                                    currency: "DKK",
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="py-3 pr-4 text-zinc-300">
                                                {TYPE_LABELS[row.type] ?? row.type}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[row.status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
                                                >
                                                    {STATUS_LABELS[row.status] ?? row.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-zinc-400 whitespace-nowrap text-xs">
                                                {fmt(row.createdAt)}
                                            </td>
                                            <td className="py-3 text-zinc-400 whitespace-nowrap text-xs">
                                                {fmt(row.paidAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                            <p className="text-xs text-zinc-500">
                                Side {page} af {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={page <= 1 || loading}
                                    onClick={() => fetchData(page - 1)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Forrige
                                </button>
                                <button
                                    disabled={page >= totalPages || loading}
                                    onClick={() => fetchData(page + 1)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Næste
                                </button>
                            </div>
                        </div>
                    )}
                </Box>
            </div>
        </div>
    );
}
