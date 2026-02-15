import { cn } from "./utils";

const SkeletonCard = ({ noBorderBottom = false }: { noBorderBottom?: boolean }) => (
    <div className={cn(
        "w-full border border-[#252424] bg-black overflow-hidden",
        noBorderBottom ? "border-b-0 rounded-t-lg" : "rounded-lg"
    )}>
        <div className="p-6">
            <div className="h-7 w-48 bg-[#252424] animate-pulse rounded-md mb-2" />
            <div className="h-4 w-full max-w-sm bg-[#252424] animate-pulse rounded-md mb-5" />
            <div className="h-10 w-full bg-[#111111] border border-[#252424] animate-pulse rounded-md" />
        </div>
        <div className="px-6 py-3 bg-[#111111] border-t border-[#252424] flex justify-end">
            <div className="h-8 w-24 bg-[#252424] animate-pulse rounded-md" />
        </div>
    </div>
);

export { SkeletonCard };