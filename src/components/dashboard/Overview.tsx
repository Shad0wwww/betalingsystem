'use client';

import GridContainer from "./GridContainer";
import LatestTrans from "./LatestTrans";
import MeterSessionBox from "./MeterSessionBox";
import AccountSummaryBox from "./AccountSummaryBox";
import SpendingChart from "./SpendingChart";

type Props = {
    dict: any;
};

const Box = ({ children }: { children: React.ReactNode }) => (
    <div className="border rounded-lg custom-box2 py-6 px-7">
        {children}
    </div>
);

export default function Overview({ dict }: Props) {
    return (
        <main className="pb-8">
            {/* Page header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Dashboard
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">{dict?.dashboard?.oversigt?.title ?? "Oversigt"}</h1>
                <p className="text-zinc-500 text-sm mt-1">{dict?.dashboard?.oversigt?.subtitle ?? "Dit overblik over forbrug og sessioner."}</p>
            </div>

            <GridContainer>
                <Box>
                    <LatestTrans dict={dict} />
                </Box>

                <Box>
                    <MeterSessionBox dict={dict} />
                </Box>

                <Box>
                    <AccountSummaryBox />
                </Box>
            </GridContainer>

            <SpendingChart />
        </main>
    );
}