"use client";
import { useEffect, useState } from "react";
import { skelelonText } from "../utils/SkeletonCard";

type Props = { dict: any };

async function fetchBalance() {
    const res = await fetch(`/api/user/me`);
    return res.json();
}

export default function Reserved({ dict }: Props) {
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchBalance()
            .then((data) => {
                if (!mounted) return;
                const bal = Number(data?.reservedBalance ?? 0);
                setBalance(isNaN(bal) ? 0 : bal);
            })
            .catch(() => mounted && setBalance(0))
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, []);

    return (
        <div className="mt-5 pt-5 border-t border-[#292828]">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1">
                {dict.dashboard.oversigt.balance}
            </p>
            {loading ? (
                skelelonText(12)
            ) : (
                <p className="text-2xl font-bold text-white">
                    {balance.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                </p>
            )}
        </div>
    );
}
