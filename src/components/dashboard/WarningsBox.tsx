"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { markWarningAsRead } from "@/lib/actions/warnings";

type Warning = {
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
};

type Props = {
    warnings: Warning[];
    onWarningRead?: (id: number) => void;
};

export default function WarningsBox({ warnings, onWarningRead }: Props) {
    const [localWarnings, setLocalWarnings] = React.useState(warnings);
    const [marking, setMarking] = React.useState<number | null>(null);

    const handleMarkAsRead = async (id: number) => {
        try {
            setMarking(id);
            await markWarningAsRead(id);
            setLocalWarnings((prev) =>
                prev.map((w) =>
                    w.id === id ? { ...w, isRead: true } : w
                )
            );
            onWarningRead?.(id);
        } catch (error) {
            console.error("Error marking warning as read:", error);
        } finally {
            setMarking(null);
        }
    };

    const unreadCount = localWarnings.filter((w) => !w.isRead).length;

    if (unreadCount === 0) {
        return null;
    }

    return (
        <div className="border border-amber-500/20 rounded-lg bg-amber-500/5 py-4 px-5 mb-6">
            <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-200 mb-2">
                        Du har {unreadCount} advarsling{unreadCount !== 1 ? "er" : ""}
                    </h3>
                    <div className="space-y-3">
                        {localWarnings.filter((w) => !w.isRead).map((warning) => (
                            <div
                                key={warning.id}
                                className="text-sm p-3 rounded border bg-amber-500/10 border-amber-500/30 text-amber-100"
                            >
                                <p className="mb-2">{warning.message}</p>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-xs text-zinc-500">
                                        Du kan se denne advarsling igen på email
                                    </span>
                                    <button
                                        onClick={() => handleMarkAsRead(warning.id)}
                                        disabled={marking === warning.id}
                                        className="text-xs px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 disabled:opacity-50 transition-colors"
                                    >
                                        {marking === warning.id
                                            ? "Gemmer..."
                                            : "Markér som læst"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
