import { getElPriser } from "@/lib/El/kWH/GetkWHPrices";
import prisma from "@/lib/prisma";
import { MeterStatus, TransactionType } from "@prisma/client";

export async function getStats() {
    try {
        let elPrices;
        
        // Try to fetch electricity prices, but don't fail if it's not available yet
        try {
            elPrices = await getElPriser();
        } catch (error) {
            console.warn("Could not fetch electricity prices:", error);
            // Fallback value when API fails
            const today = new Date().toISOString().split('T')[0];
            elPrices = {
                overblik: {
                    date: today,
                    hoejestePris: 0,
                    hoejesteTid: "--:--",
                    lavestesPris: 0,
                    lavestesTid: "--:--",
                    gennemsnit: 0,
                },
                prisLigenu: {
                    date: today,
                    pris: 0,
                    tid: "--:--",
                    underDagensGns: 0,
                },
            };
        }

        const [userCount, paymentCount, emptySpaces] = await Promise.all([
            prisma.user.count(),
            prisma.transaction.count({ where: { type: TransactionType.PAID } }),
            prisma.meter.count({ where: { status: MeterStatus.ONLINE } }),
        ]);
    
        return {
            users: userCount,
            paymentCount: paymentCount,
            elPrices: elPrices,
            emptySpaces: emptySpaces,
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback for complete failure
        const today = new Date().toISOString().split('T')[0];
        return {
            users: 0,
            paymentCount: 0,
            elPrices: {
                overblik: {
                    date: today,
                    hoejestePris: 0,
                    hoejesteTid: "--:--",
                    lavestesPris: 0,
                    lavestesTid: "--:--",
                    gennemsnit: 0,
                },
                prisLigenu: {
                    date: today,
                    pris: 0,
                    tid: "--:--",
                    underDagensGns: 0,
                },
            },
            emptySpaces: 0,
        };
    }
}
