import { columns } from "./columns"
import { DataTable } from "./data-table"
import { History } from "lucide-react"

export default function DemoPage() {
    return (
        <div className="mx-auto max-w-screen-xl px-4 md:px-20">
            <div className="container mx-auto py-10">
                <DataTable columns={columns} />
            </div>
        </div>
    )
}
