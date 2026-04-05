"use client";

import React from "react";
import { get } from "@/components/admin/actions";
import { Box } from "@/components/admin/Box";
import { Zap, Droplets, Activity } from "lucide-react";
import { columns, type ActiveSession } from "./columns";
import { DataTable } from "./data-table";
import StopSessionModal from "@/components/modals/StopSessionModal";
import WarningUserModal from "@/components/modals/WarningUserModal";

interface SessionStats {
    total: number;
    electricity: number;
    water: number;
}

function StatBox({
    label,
    value,
    icon: Icon,
    loading,
    color,
}: {
    label: string;
    value: number | undefined;
    icon: React.ElementType;
    loading: boolean;
    color: "blue" | "yellow" | "cyan";
}) {
    const colorMap = {
        blue: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            icon: "text-blue-400",
        },
        yellow: {
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            icon: "text-yellow-400",
        },
        cyan: {
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            icon: "text-cyan-400",
        },
    }
    const c = colorMap[color];

    return (
        <Box>
            <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    {label}
                </span>
                <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
                    <Icon className={`w-4 h-4 ${c.icon}`} />
                </div>
            </div>
            {loading ? (
                <div className="h-9 w-20 rounded-md animate-pulse bg-zinc-800/60" />
            ) : (
                <p className="text-3xl font-bold tracking-tight text-white">{value ?? "—"}</p>
            )}
        </Box>
    );
}

export default function AdminSessionsPage() {
    const [stats, setStats] = React.useState<SessionStats | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [stopSessionData, setStopSessionData] = React.useState<ActiveSession | null>(null);
    const [stopSessionOpen, setStopSessionOpen] = React.useState(false);
    const [warnUserData, setWarnUserData] = React.useState<{
        userId: string;
        userName: string;
        userEmail: string;
    } | null>(null);
    const [warnUserOpen, setWarnUserOpen] = React.useState(false);

    const fetchStats = React.useCallback(() => {
        setLoading(true);
        get("/api/admin/sessions/active?limit=100&page=1")
            .then((res: { data: { type: string }[]; total: number }) => {
                const electricity = res.data.filter((s) => s.type === "ELECTRICITY").length;
                const water = res.data.filter((s) => s.type === "WATER").length;
                setStats({ total: res.total, electricity, water });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    React.useEffect(() => {
        fetchStats();
        // Auto-refresh every 30 seconds
        const id = setInterval(() => {
            fetchStats();
            setRefreshKey((k) => k + 1);
        }, 30_000);
        return () => clearInterval(id);
    }, [fetchStats]);

    const handleStopSession = (session: ActiveSession) => {
        setStopSessionData(session);
        setStopSessionOpen(true);
    };

    const handleWarnUser = (session: ActiveSession) => {
        setWarnUserData({
            userId: session.userId,
            userName: session.userName,
            userEmail: session.userEmail,
        });
        setWarnUserOpen(true);
    };

    const handleStopSessionSuccess = () => {
        setStopSessionOpen(false);
        setStopSessionData(null);
        setRefreshKey((k) => k + 1);
    };

    const handleWarnUserSuccess = () => {
        setWarnUserOpen(false);
        setWarnUserData(null);
    };

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
                <h1 className="text-2xl font-bold text-white">Aktive sessioner</h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Alle både der i øjeblikket modtager strøm eller vand. Opdateres automatisk hvert 30. sekund.
                </p>
            </div>

            {/* Stat boxes */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatBox label="Aktive sessioner" value={stats?.total} icon={Activity} loading={loading} color="blue" />
                    <StatBox label="Strøm i brug" value={stats?.electricity} icon={Zap} loading={loading} color="yellow" />
                    <StatBox label="Vand i brug" value={stats?.water} icon={Droplets} loading={loading} color="cyan" />
                </div>
            </div>

            {/* Table */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 mt-6">
                <Box>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-white">Sessionsoversigt</h2>
                            <p className="text-zinc-500 text-sm mt-0.5">Alle aktive forbindelser lige nu</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                Live
                            </span>
                        </div>
                    </div>
                    <DataTable columns={columns(handleStopSession, handleWarnUser)} refreshKey={refreshKey} />
                </Box>
            </div>

            {/* Modals */}
            <StopSessionModal
                session={stopSessionData}
                open={stopSessionOpen}
                onOpenChange={setStopSessionOpen}
                onSuccess={handleStopSessionSuccess}
            />
            <WarningUserModal
                user={warnUserData}
                open={warnUserOpen}
                onOpenChange={setWarnUserOpen}
                onSuccess={handleWarnUserSuccess}
            />
        </div>
    );
}
