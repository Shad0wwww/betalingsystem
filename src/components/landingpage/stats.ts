import { getElPriser } from "@/lib/El/kWH/GetkWHPrices";
import prisma from "@/lib/prisma";
import { MeterStatus, TransactionType } from "@prisma/client";

function buildFallbackStats() {
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

async function safeCount(query: Promise<number>, label: string) {
    try {
        return await query;
    } catch (error) {
        console.warn(`Could not fetch ${label} count, using fallback value:`, error);
        return 0;
    }
}

export async function getStats() {
    try {
        const fallbackStats = buildFallbackStats();

        let elPrices;
        
        // Try to fetch electricity prices, but don't fail if it's not available yet
        try {
            elPrices = await getElPriser();
        } catch (error) {
            console.warn("Could not fetch electricity prices:", error);
            elPrices = fallbackStats.elPrices;
        }

        if (!process.env.DATABASE_URL) {
            console.warn("DATABASE_URL is missing, using fallback landing stats.");
            return {
                ...fallbackStats,
                elPrices,
            };
        }

        const [userCount, paymentCount, emptySpaces] = await Promise.all([
            safeCount(prisma.user.count(), "user"),
            safeCount(prisma.transaction.count({ where: { type: TransactionType.PAID } }), "transaction"),
            safeCount(prisma.meter.count({ where: { status: MeterStatus.ONLINE } }), "meter"),
        ]);
    
        return {
            users: userCount,
            paymentCount: paymentCount,
            elPrices: elPrices,
            emptySpaces: emptySpaces,
        };
    } catch (error) {
        console.warn("Error fetching stats, using fallback values:", error);
        return buildFallbackStats();
    }
}
