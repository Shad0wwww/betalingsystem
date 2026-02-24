import { useEffect, useState } from "react";

async function fetchLatestTransactions() {
    const res = await fetch
        (`/api/transaktioner/latest`);
    return res.json();
}

type Props = {
    dict: any;
};

export default function LatestTrans({
    dict
}: Props
) {



    const [latestTransactions, setLatestTransactions] = useState<any[]>([]);
    useEffect(() => {
        fetchLatestTransactions().then((data) => {
            setLatestTransactions(data);
        });
    }, []);

    return (
        <div className="flex flex-col">
            <p className="text-lg text-white">{dict.dashboard.oversigt.latestTransactions}</p>
            {latestTransactions.length > 0 ? (
                <div className="mt-2">
                    {latestTransactions.map((transaction) => (
                        
                        <div key={transaction.id} className="flex flex-row justify-between items-center py-2 border-b border-gray-600">
                            <p className={`font-bold ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                                {transaction.amount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                            </p>
                            <div>
                                <p className="font-bold">{transaction.description}</p>
                                <p className="text-white text-sm">{new Date(transaction.createdAt).toLocaleDateString("da-DK", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}</p>
                            </div>
                            
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm mt-2">{dict.dashboard.oversigt.noTransactionsYet}</p>
            )}
        </div>
    )
}