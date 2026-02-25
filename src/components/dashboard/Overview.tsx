'use client';
import { useEffect, useState } from "react";
import UdbetalModal from "../modals/UdbetalModal";
import GridContainer from "./GridContainer";
import { UtilityType } from "@prisma/client";
import PayButton from "./PayButton";
import LoadingScreen from "../utils/LoadingScreen";
import LatestTrans from "./LatestTrans";

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
    const [balance, setbalance] = useState<number>(0);
    const [latestTransactions, setLatestTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchBalance();
                if (!mounted) return;
                const bal = Number((data && data.balance) ?? 0);
                setbalance(isNaN(bal) ? 0 : bal);
            } catch (err) {
                console.error(err);
                if (mounted) setbalance(0);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    if (loading) return <LoadingScreen />;

    return (
        

        <main>
            <GridContainer>
                <Box>
                    <div className="flex flex-row justify-between items-center">

                        <PayButton amount={200} description="Test betaling" type={UtilityType.ELECTRICITY} dict={dict} />
                        <UdbetalModal dict={dict} />
                    </div>

                    <div className="flex flex-col mt-6 mb-1">
                        <p className="text-sm sub-headline">{dict.dashboard.oversigt.balance}</p>
                        <p className="text-white font-bold text-lg">{balance.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</p>
                    </div>
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
                {/* TEST STRIPE BETALING  */}
                
            </GridContainer>


        </main>
    );

}