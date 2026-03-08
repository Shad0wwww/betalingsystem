"use client";

import React from "react";
import { get } from "@/components/admin/actions";
import { Box } from "@/components/admin/Box";
import {
    TrendingUp,
    Zap,
    Droplets,
    Users,
    DollarSign,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface MonthData {
    month: string;
    label: string;
    income: number;
    electricity: number;
    water: number;
    newUsers: number;
}

interface Totals {
    income: number;
    electricity: number;
    water: number;
    newUsers: number;
    totalUsers: number;
}

interface StatsResponse {
    monthlyData: MonthData[];
    totals: Totals;
}

// ── Shared chart theme ─────────────────────────────────────────────────
const tooltipStyle = {
    contentStyle: {
        backgroundColor: "#0c0c0e",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        color: "#e4e4e7",
        fontSize: "12px",
    },
    labelStyle: { color: "#71717a", fontSize: "11px" },
    cursor: { fill: "rgba(255,255,255,0.04)" },
};

const axisStyle = { fill: "#52525b", fontSize: 11 };
const gridStyle = { stroke: "rgba(255,255,255,0.05)" };

// ── Summary card ───────────────────────────────────────────────────────
function SummaryCard({
    label,
    value,
    sub,
    icon: Icon,
    loading,
    color,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    loading: boolean;
    color: "blue" | "yellow" | "cyan" | "green" | "violet";
}) {
    const colors = {
        blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "text-blue-400"   },
        yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-400" },
        cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "text-cyan-400"   },
        green:  { bg: "bg-green-500/10",  border: "border-green-500/20",  icon: "text-green-400"  },
        violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "text-violet-400" },
    };
    const c = colors[color];

    return (
        <Box>
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</span>
                <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
                    <Icon className={`w-4 h-4 ${c.icon}`} />
                </div>
            </div>
            {loading ? (
                <div className="space-y-2">
                    <div className="h-8 w-28 rounded-md animate-pulse bg-zinc-800/60" />
                    <div className="h-4 w-20 rounded animate-pulse bg-zinc-800/40" />
                </div>
            ) : (
                <>
                    <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
                    {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
                </>
            )}
        </Box>
    );
}

// ── Chart wrapper ──────────────────────────────────────────────────────
function ChartBox({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
    return (
        <Box>
            <div className="mb-5">
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="text-zinc-500 text-sm mt-0.5">{sub}</p>
            </div>
            <div className="h-56">{children}</div>
        </Box>
    );
}

// ── Skeleton chart ─────────────────────────────────────────────────────
const SKELETON_HEIGHTS = [60, 87, 74, 83, 63, 52, 51, 55, 53, 89, 54, 73];

function ChartSkeleton() {
    return (
        <div className="h-56 flex items-end gap-2 px-2">
            {SKELETON_HEIGHTS.map((h, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t animate-pulse bg-zinc-800/60"
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
    );
}

export default function AdminStatsPage() {
    const [data, setData] = React.useState<StatsResponse | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        get("/api/admin/stats")
            .then((res) => setData(res as StatsResponse))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totals = data?.totals;
    const monthly = data?.monthlyData ?? [];

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Admin
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">Statistikker</h1>
                <p className="text-zinc-500 text-sm mt-1">Overblik over de seneste 12 måneder.</p>
            </div>

            {/* Summary cards */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <SummaryCard
                        label="Omsætning (12 mdr.)"
                        value={totals ? totals.income.toLocaleString("da-DK", { style: "currency", currency: "DKK", minimumFractionDigits: 0 }) : "—"}
                        sub="Betalte fakturaer"
                        icon={DollarSign}
                        loading={loading}
                        color="green"
                    />
                    <SummaryCard
                        label="Elforbrug (12 mdr.)"
                        value={totals ? `${totals.electricity.toLocaleString("da-DK", { maximumFractionDigits: 1 })} kWh` : "—"}
                        sub="Afsluttede sessioner"
                        icon={Zap}
                        loading={loading}
                        color="yellow"
                    />
                    <SummaryCard
                        label="Vandforbrug (12 mdr.)"
                        value={totals ? `${totals.water.toLocaleString("da-DK", { maximumFractionDigits: 1 })} m³` : "—"}
                        sub="Afsluttede sessioner"
                        icon={Droplets}
                        loading={loading}
                        color="cyan"
                    />
                    <SummaryCard
                        label="Nye brugere (12 mdr.)"
                        value={totals ? String(totals.newUsers) : "—"}
                        sub="Registreringer"
                        icon={TrendingUp}
                        loading={loading}
                        color="blue"
                    />
                    <SummaryCard
                        label="Brugere i alt"
                        value={totals ? String(totals.totalUsers) : "—"}
                        sub="Alle konti"
                        icon={Users}
                        loading={loading}
                        color="violet"
                    />
                </div>
            </div>

            {/* Charts */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 mt-6 space-y-6">

                {/* Income */}
                <ChartBox title="Månedlig omsætning" sub="Betalte fakturaer i kr. de seneste 12 måneder">
                    {loading ? <ChartSkeleton /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={axisStyle}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v} kr`}
                                    width={60}
                                />
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(v) =>
                                        [(Number(v ?? 0)).toLocaleString("da-DK", { style: "currency", currency: "DKK", minimumFractionDigits: 0 }), "Omsætning"]
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fill="url(#incomeGrad)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: "#22c55e" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartBox>

                {/* Consumption */}
                <ChartBox title="Månedligt forbrug" sub="Elforbrug (kWh) og vandforbrug (m³) de seneste 12 måneder">
                    {loading ? <ChartSkeleton /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                                <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} />
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(v, name) => [
                                        (Number(v ?? 0)).toLocaleString("da-DK", { maximumFractionDigits: 2 }),
                                        name === "electricity" ? "El (kWh)" : "Vand (m³)",
                                    ]}
                                />
                                <Legend
                                    formatter={(value) => (
                                        <span style={{ color: "#a1a1aa", fontSize: 11 }}>
                                            {value === "electricity" ? "El (kWh)" : "Vand (m³)"}
                                        </span>
                                    )}
                                />
                                <Bar dataKey="electricity" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="water" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartBox>

                {/* New users */}
                <ChartBox title="Nye brugere pr. måned" sub="Antal nyoprettede konti de seneste 12 måneder">
                    {loading ? <ChartSkeleton /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={axisStyle}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    width={32}
                                />
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(v) => [Number(v ?? 0), "Nye brugere"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="newUsers"
                                    stroke="#818cf8"
                                    strokeWidth={2}
                                    fill="url(#usersGrad)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: "#818cf8" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartBox>
            </div>
        </div>
    );
}
