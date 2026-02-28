import { cookies } from "next/headers"
import { DataTable } from "./data-table"

import { AuditLog, columns } from "./columns"


async function getData(): Promise<AuditLog[]> {
    const cookieStore = await cookies()

    const token = cookieStore.get("auth_token")?.value


    const response = await fetch(`${process.env.URL_BASE}/api/admin/auditlogs/all`, {
        method: "GET",
        credentials: "include",
        headers: {
            "authorization": `Bearer ${token}`,
        },

    })

    const data = await response.json()

    return data as AuditLog[]
}

export default async function AdminPageLogs() {


    const data = await getData()

    return (
        <div className="mx-auto max-w-screen-xl px-4 md:px-20">
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={data} />

            </div>
        </div>



    )
}