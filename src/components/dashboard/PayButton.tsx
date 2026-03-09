"use client";
import { useState } from "react";
import { UtilityType } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { createStripeCheckout } from "@/lib/actions/dashboard";

export default function PayButton(
    { amount, description, type, dict }: { amount: number; description: string; type: UtilityType; dict: any }
) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const data = await createStripeCheckout(amount * 100, description, type);
            if (data?.url) {
                window.location.href = data.url;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Henter..." : `${dict.dashboard.oversigt.payButton} ${amount} DKK`}
        </button>
    );
}
