"use client";
import { useEffect, useState } from "react";
import { getAllTransactions } from "@/lib/actions/dashboard";

type MonthData = {
    key: string;   // YYYY-MM
    label: string; // e.g. "mar"
    amount: number;
};

type InvoiceRow = {
    amount: number;
    status: "success" | "failed" | "pending";
    dato: string; // YYYY-MM-DD
};

const MONTH_NAMES_DA = [
    "jan", "feb", "mar", "apr", "maj", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec",
];

function getLast6Months(): { key: string; label: string }[] {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            label: MONTH_NAMES_DA[d.getMonth()],
        };
    });
}

export default function SpendingChart() {
    const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
    const [totalAllTime, setTotalAllTime] = useState<number>(0);
    const [sessionCount, setSessionCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllTransactions(1, 500)
            .then((txData) => {
                const txs: InvoiceRow[] = Array.isArray(txData?.data) ? txData.data : [];
                const paid = txs.filter((t) => t.status === "success");

                setTotalAllTime(paid.reduce((sum, t) => sum + (t.amount || 0), 0));
                setSessionCount(paid.length);

                const grouped: Record<string, number> = {};
                for (const tx of paid) {
                    const key = tx.dato?.substring(0, 7); 
                    if (key) grouped[key] = (grouped[key] ?? 0) + (tx.amount || 0);
                }

                const months = getLast6Months();
                setMonthlyData(
                    months.map(({ key, label }) => ({
                        key,
                        label,
                        amount: grouped[key] ?? 0,
                    }))
                );
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const maxAmount = Math.max(...monthlyData.map((m) => m.amount), 1);
    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const isEmpty = monthlyData.every((m) => m.amount === 0);

    return (
        <div className="mx-auto max-w-screen-xl px-4 md:px-20 mt-4">
            <div className="border rounded-lg custom-box2 py-6 px-7">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                            Forbrug
                        </p>
                        <p className="text-lg font-semibold text-white mt-1">
                            Månedligt overblik
                        </p>
                    </div>

                    <div className="flex gap-6 ml-auto">
                        {/* Total all-time */}
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">
                                Samlet forbrug
                            </p>
                            {loading ? (
                                <div className="h-6 w-24 bg-[#1a1a1a] animate-pulse rounded mt-1" />
                            ) : (
                                <p className="text-xl font-bold text-white mt-1 tabular-nums">
                                    {totalAllTime.toLocaleString("da-DK", {
                                        style: "currency",
                                        currency: "DKK",
                                    })}
                                </p>
                            )}
                        </div>

                        {/* Session count */}
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">
                                Sessioner
                            </p>
                            {loading ? (
                                <div className="h-6 w-10 bg-[#1a1a1a] animate-pulse rounded mt-1" />
                            ) : (
                                <p className="text-xl font-bold text-white mt-1 tabular-nums">
                                    {sessionCount}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bar chart */}
                {loading ? (
                    <div className="flex items-end gap-3 h-36">
                        {[65, 40, 80, 30, 55, 90].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full rounded-md bg-[#1a1a1a] animate-pulse"
                                    style={{ height: `${h}%` }}
                                />
                                <div className="h-3 w-6 bg-[#1a1a1a] animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-zinc-500 text-sm">
                            Ingen betalinger de seneste 6 måneder
                        </p>
                    </div>
                ) : (
                    <div className="flex items-end gap-2 sm:gap-3 h-36">
                        {monthlyData.map((month) => {
                            const heightPct =
                                month.amount > 0
                                    ? Math.max((month.amount / maxAmount) * 100, 5)
                                    : 1;
                            const isCurrent = month.key === currentMonthKey;
                            const isPeak =
                                month.amount === maxAmount && maxAmount > 0;

                            return (
                                <div
                                    key={month.key}
                                    className="flex-1 flex flex-col items-center gap-1.5 group"
                                >
                                    <div
                                        className="w-full relative flex flex-col justify-end"
                                        style={{ height: "120px" }}
                                    >
                                        {/* Tooltip on hover */}
                                        {month.amount > 0 && (
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#111] border border-[#2a2a2a] px-1.5 py-0.5 rounded">
                                                {month.amount.toLocaleString("da-DK", {
                                                    style: "currency",
                                                    currency: "DKK",
                                                    maximumFractionDigits: 0,
                                                })}
                                            </span>
                                        )}

                                        <div
                                            className={`w-full rounded-md transition-all duration-300 ${
                                                isCurrent
                                                    ? "bg-blue-500"
                                                    : isPeak
                                                    ? "bg-zinc-300"
                                                    : "bg-zinc-700 group-hover:bg-zinc-500"
                                            }`}
                                            style={{ height: `${heightPct}%` }}
                                        />
                                    </div>

                                    <p
                                        className={`text-[11px] font-medium ${
                                            isCurrent ? "text-blue-400" : "text-zinc-500"
                                        }`}
                                    >
                                        {month.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
