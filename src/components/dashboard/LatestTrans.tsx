"use client";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { getLatestTransactions } from "@/lib/actions/dashboard";

type Props = { dict: any };

export default function LatestTrans({ dict }: Props) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLatestTransactions()
            .then((data) => setTransactions(Array.isArray(data) ? data : []))
            .catch(() => setTransactions([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col h-full">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
                {dict.dashboard.oversigt.latestTransactions}
            </p>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-[#292828]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] animate-pulse" />
                                <div className="space-y-1.5">
                                    <div className="h-3 w-24 bg-[#1a1a1a] animate-pulse rounded" />
                                    <div className="h-2.5 w-16 bg-[#1a1a1a] animate-pulse rounded" />
                                </div>
                            </div>
                            <div className="h-4 w-16 bg-[#1a1a1a] animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-6 text-center">
                    <p className="text-zinc-500 text-sm">{dict.dashboard.oversigt.noTransactionsYet}</p>
                </div>
            ) : (
                <div className="divide-y divide-[#292828]">
                    {transactions.map((t) => {
                        const positive = t.amount >= 0;
                        return (
                            <div key={t.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        positive ? "bg-green-500/10" : "bg-red-500/10"
                                    }`}>
                                        {positive
                                            ? <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                            : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white leading-tight">
                                            {t.type === "PAID" ? "Betaling" : t.type === "REFUND" ? "Refundering" : t.type}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {new Date(t.createdAt).toLocaleDateString("da-DK", {
                                                day: "2-digit", month: "short", year: "2-digit",
                                                hour: "2-digit", minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-sm font-semibold tabular-nums ${
                                    positive ? "text-green-400" : "text-red-400"
                                }`}>
                                    {positive ? "+" : ""}{(t.amount/100).toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}