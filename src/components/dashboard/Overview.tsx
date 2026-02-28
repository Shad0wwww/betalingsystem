'use client';

import UdbetalModal from "../modals/UdbetalModal";
import GridContainer from "./GridContainer";
import { UtilityType } from "@prisma/client";
import PayButton from "./PayButton";
import LatestTrans from "./LatestTrans";
import Reserved from "./reserved";

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
                    <div className="flex flex-row justify-between items-center">

                        <PayButton amount={200} description="Reserverer 200 DKK" type={UtilityType.ELECTRICITY} dict={dict} />
                    </div>
                    <Reserved dict={dict} />
                    
                </Box>

                <Box>
                    <LatestTrans dict={dict} />
                </Box>

                <Box>
                    <div className="flex flex-col">
                        <p className="text-sm sub-headline">Seneste transaktioner</p>
                        <p className="text-gray-500 text-sm mt-2">Du har ingen transaktioner endnu.</p>
                    </div>
                </Box>
                
            </GridContainer>


        </main>
    );

}