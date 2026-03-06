"use client";
import { useEffect, useState } from "react";
import { User, Wallet, TrendingUp, Mail } from "lucide-react";

type UserData = {
    name: string;
    email: string;
    reservedBalance: number;
};

type InvoiceRow = {
    amount: number;
    status: "success" | "failed" | "pending";
    dato: string; // YYYY-MM-DD
};

export default function AccountSummaryBox() {
    const [user, setUser] = useState<UserData | null>(null);
    const [monthSpent, setMonthSpent] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/user/me").then((r) => r.json()),
            fetch("/api/transaktioner/all?limit=100").then((r) => r.json()),
        ])
            .then(([userData, txData]) => {
                setUser(userData);

                const now = new Date();
                const txs: InvoiceRow[] = Array.isArray(txData?.data) ? txData.data : [];

                const total = txs
                    .filter((t) => {
                        if (t.status !== "success") return false;
                        const d = new Date(t.dato);
                        return (
                            d.getMonth() === now.getMonth() &&
                            d.getFullYear() === now.getFullYear()
                        );
                    })
                    .reduce((sum, t) => sum + (t.amount || 0), 0);

                setMonthSpent(total);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Konto
            </p>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="h-3.5 w-16 bg-[#1a1a1a] animate-pulse rounded" />
                            <div className="h-3.5 w-28 bg-[#1a1a1a] animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm">
                        <User className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Navn</span>
                        <span className="ml-auto text-white font-medium truncate max-w-[150px]">
                            {user?.name ?? "–"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                        <Mail className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Email</span>
                        <span className="ml-auto text-white truncate max-w-[150px] text-xs">
                            {user?.email ?? "–"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm pt-1 border-t border-[#292828]">
                        <Wallet className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Reserveret</span>
                        <span className="ml-auto text-amber-400 font-semibold tabular-nums">
                            {(user?.reservedBalance ?? 0).toLocaleString("da-DK", {
                                style: "currency",
                                currency: "DKK",
                            })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                        <TrendingUp className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Denne måned</span>
                        <span className="ml-auto text-white font-semibold tabular-nums">
                            {monthSpent !== null
                                ? monthSpent.toLocaleString("da-DK", {
                                      style: "currency",
                                      currency: "DKK",
                                  })
                                : "–"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
