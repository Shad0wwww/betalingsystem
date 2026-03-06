import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function DemoPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 mx-auto w-full max-w-screen-xl px-4 md:px-20">
                <div className="container mx-auto py-10 mb-10">
                    <DataTable columns={columns} />
                </div>
            </main>

        </div>
    )
}
