



import React from "react";

export function Box({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="rounded-xl py-6 px-7 transition-shadow"
            style={{
                background: "var(--box-color)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--box-shadow)",
            }}
        >
            {children}
        </div>
    );
}