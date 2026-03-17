import { getElPriser } from "@/lib/El/kWH/GetkWHPrices";
import prisma from "@/lib/prisma";
import { MeterStatus, TransactionType } from "@prisma/client";

export async function getStats() {

    const [userCount, paymentCount, emptySpaces, elPrices] = await Promise.all([
        prisma.user.count(),
        prisma.transaction.count({ where: { type: TransactionType.PAID } }),
        prisma.meter.count({ where: { status: MeterStatus.ONLINE } }),
        getElPriser(),
    ]);
    
    return {
        users: userCount,
        paymentCount: paymentCount,
        elPrices: elPrices,
        emptySpaces: emptySpaces,
    };
}
