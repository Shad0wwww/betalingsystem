"use client";

import React from "react";
import { get } from "@/components/admin/actions";
import { Box } from "@/components/admin/Box";
import { Users, CreditCard, TrendingUp } from "lucide-react";
import { columns } from "./columns"
import { DataTable } from "./data-table"
import toDKK from "@/lib/utils/toDKK";


interface Response {
    usersSize: number;
    paymentsSize: number;
    totalRevenue: number;
    TotalReservationsMadeEachMonth: {
        month: number;
        year: number;
        count: number;
    }[];
}

function StatBox({
    label,
    value,
    icon: Icon,
    loading,
}: {
    label: string;
    value: string | number | undefined;
    icon: React.ElementType;
    loading: boolean;
}) {
    return (
        <Box>
            <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    {label}
                </span>
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Icon className="w-4 h-4 text-blue-400" />
                </div>
            </div>
            {loading ? (
                <div className="h-9 w-32 rounded-md animate-pulse bg-zinc-800/60" />
            ) : (
                <p className="text-3xl font-bold tracking-tight text-white">
                    {value ?? "—"}
                </p>
            )}
        </Box>
    );
}

export default function AdminPage() {
    const [data, setData] = React.useState<Response | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        get("api/admin/utils/stats")
            .then((res) => setData(res as Response))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen pb-12">
            {/* Page header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Admin
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">Oversigt</h1>
                <p className="text-zinc-500 text-sm mt-1">Samlet overblik over systemet.</p>
            </div>

            {/* Stat boxes */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <StatBox
                        label="Brugere"
                        value={data?.usersSize}
                        icon={Users}
                        loading={loading}
                    />
                    <StatBox
                        label="Betalinger"
                        value={data?.paymentsSize}
                        icon={CreditCard}
                        loading={loading}
                    />
                    <StatBox
                        label="Total omsætning"
                        value={
                            data?.totalRevenue != null
                                ? `${toDKK(data.totalRevenue)}`
                                : undefined
                        }
                        icon={TrendingUp}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Payments table */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 mt-6">
                <Box>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-white">Seneste betalinger</h2>
                            <p className="text-zinc-500 text-sm mt-0.5">Alle registrerede transaktioner</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_2px_rgba(96,165,250,0.5)]" />
                    </div>
                    <DataTable columns={columns} />
                </Box>
            </div>
        </div>
    );
}