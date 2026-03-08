"use client";

import React from "react";
import { get } from "@/components/admin/actions";
import { Box } from "@/components/admin/Box";
import { Activity, Zap } from "lucide-react";
import RegisterMeterModal from "@/components/modals/RegisterMeterModal";
import EditMeterModal from "@/components/modals/EditMeterModal";
import { MeterData } from "@/components/modals/RegisterMeterModal";
import { getColumns, Meter } from "./columns";
import { DataTable } from "./data-table";
import type { EditMeterData } from "@/components/modals/EditMeterModal";

// TODO: Tilpas denne interface til hvad API'et returnerer
interface MeterStats {
    totalMeters: number;
    activeMeters: number;
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

export default function AdminPageMeters() {
    const [stats, setStats] = React.useState<MeterStats | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        get("/api/modbus/meter/statistik")
            .then((res) => setStats(res as MeterStats))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const [refreshKey, setRefreshKey] = React.useState(0);
    const [editingMeter, setEditingMeter] = React.useState<EditMeterData | null>(null);
    const [editOpen, setEditOpen] = React.useState(false);

    const handleMeterRegistered = (_newMeter: MeterData) => {
        setRefreshKey((k) => k + 1);
    };

    const handleEdit = (meter: Meter) => {
        setEditingMeter(meter as EditMeterData);
        setEditOpen(true);
    };

    const handleEditSuccess = () => {
        setRefreshKey((k) => k + 1);
    };

    return (
        <div className="min-h-screen pb-12">
            <EditMeterModal
                meter={editingMeter}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={handleEditSuccess}
            />
            {/* Page header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Admin
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">Målere</h1>
                <p className="text-zinc-500 text-sm mt-1">Administrér og overvåg alle tilsluttede målere.</p>
            </div>

            {/* Stat boxes */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatBox
                        label="Målere i alt"
                        value={stats?.totalMeters}
                        icon={Activity}
                        loading={loading}
                    />
                    <StatBox
                        label="Aktive målere"
                        value={stats?.activeMeters}
                        icon={Zap}
                        loading={loading}
                    />
                </div>
            </div>

            <div className="mx-auto max-w-screen-xl px-4 md:px-20 mt-6">
                <Box>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-white">Måleroversigt</h2>
                            <p className="text-zinc-500 text-sm mt-0.5">Alle registrerede målere</p>
                        </div>
                        <RegisterMeterModal onSuccess={handleMeterRegistered} />
                    </div>
                    <DataTable columns={getColumns(handleEdit)} refreshKey={refreshKey} />
                </Box>
            </div>
        </div>
    );
}