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
        <div className="flex items-center justify-center gap-0 mt-10 sm:mt-14 border border-white/10 rounded-2xl px-1 sm:px-2 py-3 sm:py-4 bg-white/5 backdrop-blur-sm w-full max-w-lg sm:max-w-none">
            {stats.map((stat, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center px-3 xs:px-5 sm:px-10 md:px-14 flex-1">
                        <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight">
                            {stat.value}
                        </span>
                        <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em] sm:tracking-[0.18em] mt-1.5 sm:mt-2 text-center leading-tight">
                            {stat.label}
                        </span>
                    </div>
                    {index < stats.length - 1 && (
                        <div className="w-px h-8 sm:h-10 bg-white/15 flex-shrink-0" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default StatsSection;