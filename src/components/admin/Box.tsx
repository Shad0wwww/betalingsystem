



import React from "react";

export function Box({ children }: { children: React.ReactNode }) {
    return (
        <div className="border rounded-lg custom-box2 py-6 px-7">
            {children}
        </div>
    );
}