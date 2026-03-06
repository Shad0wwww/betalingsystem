'use client';

import GridContainer from "./GridContainer";
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
                    <LatestTrans dict={dict} />
                </Box>

                <Box>
                    <MeterSessionBox dict={dict} />
                </Box>
                
            </GridContainer>


        </main>
    );

}