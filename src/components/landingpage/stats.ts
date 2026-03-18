import { getElPriser } from "@/lib/El/kWH/GetkWHPrices";
import prisma from "@/lib/prisma";
import { MeterStatus, TransactionType } from "@prisma/client";

export async function getStats() {

    let elPrices;
    try {
        elPrices = await getElPriser();
    } catch (error) {
        // Fallback when prices aren't available yet
        elPrices = {
            overblik: {
                date: new Date().toISOString().split('T')[0],
                hoejestePris: 0,
                hoejesteTid: "--:--",
                lavestesPris: 0,
                lavestesTid: "--:--",
                gennemsnit: 0,
            },
            prisLigenu: {
                date: new Date().toISOString().split('T')[0],
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
}
