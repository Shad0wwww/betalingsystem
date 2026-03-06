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