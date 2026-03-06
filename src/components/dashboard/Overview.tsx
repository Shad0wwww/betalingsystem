'use client';

import UdbetalModal from "../modals/UdbetalModal";
import GridContainer from "./GridContainer";
import { UtilityType } from "@prisma/client";
import PayButton from "./PayButton";
import LatestTrans from "./LatestTrans";
import Reserved from "./reserved";
import MeterSessionBox from "./MeterSessionBox";

type Props = {
    dict: any;
};


const Box = (
    { children }: { children: React.ReactNode }
) => (
    <div className="border rounded-lg custom-box2 py-6 px-7">
        {children}
    </div>
);


export default function Overview(
    { dict }: Props
) {
    return (
        

        <main>
            <GridContainer>
                <Box>
                    <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
                        Reserver saldo
                    </p>
                    <div className="flex items-center justify-between">
                        <PayButton amount={200} description="Reserverer 200 DKK" type={UtilityType.ELECTRICITY} dict={dict} />
                    </div>
                    <Reserved dict={dict} />
                </Box>

                <Box>
                    <LatestTrans dict={dict} />
                </Box>

                <Box>
                    <MeterSessionBox dict={dict} />
                </Box>
                
            </GridContainer>


        </main>
    );

}