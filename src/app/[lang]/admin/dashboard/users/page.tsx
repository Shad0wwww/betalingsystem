import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Box } from "@/components/admin/Box"

export default function AdminPageLogs() {
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
                <h1 className="text-2xl font-bold text-white">Brugere</h1>
                <p className="text-zinc-500 text-sm mt-1">Alle registrerede brugere i systemet.</p>
            </div>

            <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                <Box>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-white">Brugeroversigt</h2>
                            <p className="text-zinc-500 text-sm mt-0.5">Klik på en bruger for at se detaljer</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_2px_rgba(96,165,250,0.5)]" />
                    </div>
                    <DataTable columns={columns} />
                </Box>
            </div>
        </div>
    )
}
