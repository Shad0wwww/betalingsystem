"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";

interface HistorikClientProps {
    dict: any;
}

export function HistorikClient({ dict }: HistorikClientProps) {
    return (
        <DataTable columns={columns(dict)} dict={dict} />
    );
}
