import { useEffect, useState } from "react";
import LoadingScreen from "../utils/LoadingScreen";
import { skelelonText } from '../utils/SkeletonCard';



type Props = {
    dict: any;
};

async function fetchBalance() {
    const res = await fetch(`/api/user/me`);
    return res.json();
}



export default function Reserved(
    { dict }: Props
) {

    const [balance, setbalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function loadBalance() {
            setLoading(true);
            try {
                const data = await fetchBalance();
                if (!mounted) return;
                const bal = Number(data?.balance ?? 0);
                setbalance(isNaN(bal) ? 0 : bal);
            } catch (err) {
                console.error(err);
                if (mounted) setbalance(0);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadBalance();
        return () => { mounted = false; };
    }, []);


    if (loading) return (
        <div className="flex flex-col mt-6 mb-1">
            <p className="text-sm sub-headline">{dict.dashboard.oversigt.balance}</p>
            {skelelonText(10)}
        </div>
    );


    return (
        <div className="flex flex-col mt-6 mb-1">
            <p className="text-sm sub-headline">{dict.dashboard.oversigt.balance}</p>
            <p className="text-white font-bold text-lg">{balance.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</p>
        </div>
    );
}