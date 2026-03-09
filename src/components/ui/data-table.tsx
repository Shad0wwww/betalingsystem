"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import React from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    fetchUrl?: string
    fetchAction?: (page: number, limit: number) => Promise<{ data: TData[]; total: number }>
    limit?: number
    searchColumn?: string
    searchPlaceholder?: string
    emptyMessage?: string
    refreshKey?: number
}

export function DataTable<TData, TValue>({
    columns,
    fetchUrl,
    fetchAction,
    limit = 20,
    searchColumn,
    searchPlaceholder = "Søg...",
    emptyMessage = "Ingen data at vise.",
    refreshKey = 0,
}: DataTableProps<TData, TValue>) {
    const [data, setData] = React.useState<TData[]>([])
    const [total, setTotal] = React.useState(0)
    const [page, setPage] = React.useState(1)
    const [search, setSearch] = React.useState("")
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [sorting, setSorting] = React.useState<SortingState>([])

    const pageCount = Math.max(1, Math.ceil(total / limit))

    React.useEffect(() => {
        setLoading(true)
        setError(null)

        const load = fetchAction
            ? fetchAction(page, limit).then((res) => {
                setData(res.data ?? [])
                setTotal(res.total ?? 0)
            })
            : (() => {
                const url = new URL(fetchUrl!, window.location.origin)
                url.searchParams.set("page", String(page))
                url.searchParams.set("limit", String(limit))
                return fetch(url.toString(), { credentials: "include" })
                    .then((r) => {
                        if (!r.ok) throw new Error(`API fejl: ${r.status} ${r.statusText}`)
                        return r.json()
                    })
                    .then((res) => {
                        setData(res.data ?? [])
                        setTotal(res.total ?? 0)
                    })
            })()

        load
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [page, limit, fetchUrl, fetchAction, refreshKey])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        manualPagination: true,
        pageCount,
        state: { sorting },
    })

    return (
        <div className="space-y-4">
            {searchColumn && (
                <div className="flex items-center">
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        className="max-w-sm"
                        style={{
                            background: "var(--box-color-lighter)",
                            border: "1px solid var(--border-color)",
                            color: "var(--headline-color)",
                        }}
                    />
                </div>
            )}

            <div className="rounded-md overflow-hidden" style={{ border: "1px solid var(--border-color)", background: "var(--box-color)" }}>
                <Table>
                    <TableHeader style={{ background: "var(--box-color-lighter)" }}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} style={{ borderColor: "var(--border-color)" }}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-medium" style={{ color: "var(--sub-headline)" }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody style={{ color: "var(--headline-color)" }}>
                        {error ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-red-400">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            Array.from({ length: limit }).map((_, i) => (
                                <TableRow key={i} style={{ borderColor: "var(--border-color)" }}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j} className="py-3">
                                            <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "var(--box-color-lighter)" }} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="transition-colors"
                                    style={{ borderColor: "var(--border-color)" }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                    style={{ color: "var(--sub-headline)" }}
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <p className="text-sm" style={{ color: "var(--sub-headline)" }}>
                    {total} rækker i alt
                </p>
                <div className="flex items-center space-x-2">
                    {[
                        { icon: ChevronsLeft, label: "Første side", onClick: () => setPage(1), disabled: page === 1, hidden: true },
                        { icon: ChevronLeft, label: "Forrige side", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, hidden: false },
                    ].map(({ icon: Icon, label, onClick, disabled, hidden }, i) => (
                        <button
                            key={i}
                            onClick={onClick}
                            disabled={disabled}
                            aria-label={label}
                            className={hidden ? "hidden lg:flex" : "flex"}
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "1px solid var(--border-color)",
                                background: "var(--box-color-lighter)",
                                color: "var(--headline-color)",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.4 : 1,
                            }}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    ))}
                    <span className="text-sm w-24 text-center" style={{ color: "var(--headline-color)" }}>
                        Side {page} af {pageCount}
                    </span>
                    {[
                        { icon: ChevronRight, label: "Næste side", onClick: () => setPage((p) => Math.min(pageCount, p + 1)), disabled: page === pageCount, hidden: false },
                        { icon: ChevronsRight, label: "Sidste side", onClick: () => setPage(pageCount), disabled: page === pageCount, hidden: true },
                    ].map(({ icon: Icon, label, onClick, disabled, hidden }, i) => (
                        <button
                            key={i}
                            onClick={onClick}
                            disabled={disabled}
                            aria-label={label}
                            className={hidden ? "hidden lg:flex" : "flex"}
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "1px solid var(--border-color)",
                                background: "var(--box-color-lighter)",
                                color: "var(--headline-color)",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.4 : 1,
                            }}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
