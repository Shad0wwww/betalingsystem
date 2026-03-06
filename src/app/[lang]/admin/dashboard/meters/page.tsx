"use client";

import React from "react";
import { get } from "@/components/admin/actions";
import { Box } from "@/components/admin/Box";
import GridContainer from "@/components/dashboard/GridContainer";
import { Activity, Zap, Droplets } from "lucide-react"; // TODO: Skift ikoner hvis ønsket
import { columns } from "./columns";
import { DataTable } from "./data-table";
import RegisterMeterModal from "@/components/modals/RegisterMeterModal";
import { MeterData } from "@/components/modals/RegisterMeterModal";

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
            <div className="flex items-center justify-between mb-4">
                <span
                    className="text-sm font-medium uppercase tracking-widest"
                    style={{ color: "var(--sub-headline)" }}
                >
                    {label}
                </span>
                <div
                    className="p-2 rounded-lg"
                    style={{ background: "var(--box-color-lighter)" }}
                >
                    <Icon className="w-4 h-4" style={{ color: "var(--primary-color)" }} />
                </div>
            </div>
            {loading ? (
                <div
                    className="h-9 w-28 rounded-md animate-pulse"
                    style={{ background: "var(--box-color-lighter)" }}
                />
            ) : (
                <p
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: "var(--headline-color)" }}
                >
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

    const handleMeterRegistered = (_newMeter: MeterData) => {
        setRefreshKey((k) => k + 1);
    };

    return (
        <div>
            <GridContainer>
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
                {/* TODO: Tilføj eller fjern StatBox-felter efter behov */}
            </GridContainer>

            <div className="mx-auto max-w-screen-xl px-4 md:px-20 mt-6 mb-10">
                <Box>
                    <div className="flex items-center justify-between mb-5">
                        <h2
                            className="text-lg font-semibold"
                            style={{ color: "var(--headline-color)" }}
                        >
                            Målere
                        </h2>
                        <RegisterMeterModal onSuccess={handleMeterRegistered} />
                    </div>
                    <DataTable columns={columns} refreshKey={refreshKey} />
                </Box>
            </div>
        </div>
    );
}