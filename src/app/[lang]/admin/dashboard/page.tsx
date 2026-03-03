"use client";

import React from "react";
import { get } from "@/components/admin/actions";
import { Box } from "@/components/admin/Box";
import GridContainer from "@/components/dashboard/GridContainer";
import { Users, CreditCard, TrendingUp } from "lucide-react";
import { columns } from "./columns"
import { DataTable } from "./data-table"


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
        <div>
            <GridContainer>
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
                            ? `${data.totalRevenue.toLocaleString("da-DK")} kr.`
                            : undefined
                    }
                    icon={TrendingUp}
                    loading={loading}
                />
            </GridContainer>

            <div className="mx-auto max-w-screen-xl px-4 md:px-20 mt-6 mb-10">
                <Box>
                    <h2
                        className="text-lg font-semibold mb-5"
                        style={{ color: "var(--headline-color)" }}
                    >
                        Seneste betalinger
                    </h2>
                    <DataTable columns={columns} />
                </Box>
            </div>
        </div>



    );
}