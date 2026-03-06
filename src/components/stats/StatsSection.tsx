import React, { FC } from "react";

interface StatProps {
    value: string;
    label: string;
}

export interface StatsSectionProps {
    stats: StatProps[];
}

const StatsSection: FC<StatsSectionProps> = ({ stats }) => {
    return (
        <div className="flex items-center justify-center gap-0 mt-14 border border-white/10 rounded-2xl px-2 py-4 bg-white/5 backdrop-blur-sm">
            {stats.map((stat, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center px-10 sm:px-14">
                        <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums tracking-tight">
                            {stat.value}
                        </span>
                        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.18em] mt-2 whitespace-nowrap">
                            {stat.label}
                        </span>
                    </div>
                    {index < stats.length - 1 && (
                        <div className="w-px h-10 bg-white/15 flex-shrink-0" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default StatsSection;