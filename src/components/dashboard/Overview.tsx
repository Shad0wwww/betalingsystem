'use client';
import { useEffect, useState } from "react";
import UdbetalModal from "../modals/UdbetalModal";
import GridContainer from "./GridContainer";

type Props = {
    dict: any;
};

async function fetchBalance() {
    const res = await fetch(`/api/user/me`);
    return res.json();
}


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
    const [balance, setbalance] = useState<Float16Array>(new Float16Array(0));

    useEffect(() => {
        fetchBalance().then((data) => {
            setbalance(data.balance);
        }).catch(() => { });
        
     }, []);

    return (

        <main>
            <GridContainer>
                <Box>
                    <div className="flex flex-row justify-between items-center">

                        <UdbetalModal />
                    </div>

                    <div className="flex flex-col mt-6 mb-1">
                        <p className="text-sm sub-headline">Balance</p>
                        <p className="text-white font-bold text-lg">{balance.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</p>
                    </div>
                </Box>

                <Box>
                    <div className="flex flex-col">
                        <p className="text-sm sub-headline">Seneste transaktioner</p>
                        <p className="text-gray-500 text-sm mt-2">Du har ingen transaktioner endnu.</p>
                    </div>
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