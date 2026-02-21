import { FC } from "react";

interface StatProps {
    value: string;
    label: string;
}

const Stat: FC<StatProps> = ({ value, label }) => {
    return (
        <div className="flex flex-col items-center px-12 py-4 min-w-[200px]">
            {/* Tallet - Stor, hvid og fed */}
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {value}
            </h2>
            {/* Label - Lille, grå, uppercase og med lidt afstand mellem bogstaverne */}
            <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-[0.15em] mt-2">
                {label}
            </p>
        </div>
    );
};

export interface StatsSectionProps {
    stats: StatProps[];
}

const StatsSection: FC<StatsSectionProps> = ({ stats }) => {
    return (
        <section className="w-full bg-[#111111] py-4 flex justify-center border border-neutral-800 mb-20">
            <div className="flex flex-col lg:flex-row items-center lg:divide-x lg:divide-neutral-800">
                {stats.map((stat, index) => (
                    <Stat
                        key={index}
                        value={stat.value}
                        label={stat.label}
                    />
                ))}
            </div>
        </section>
    );
};

export default StatsSection;