import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const usersSize = await prisma.user.count();
    const TotalReservationsMadeEachMonth = await prisma.transaction.groupBy({
        by: ["createdAt"],
        _count: {
            id: true,
        },
    });

    const paymentsSize = await prisma.transaction.count();

    const totalRevenue = await prisma.transaction.aggregate({
        where: {
            type: TransactionType.PAID,
        },
        _sum: {
            amount: true,
        },
    });

    return NextResponse.json({
        usersSize,
        paymentsSize,
        totalRevenue: totalRevenue._sum.amount || 0,
        TotalReservationsMadeEachMonth: TotalReservationsMadeEachMonth.map((item) => ({
            month: item.createdAt.getMonth() + 1,
            year: item.createdAt.getFullYear(),
            count: item._count.id,
        })),
    });
}
