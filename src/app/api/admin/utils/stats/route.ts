import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { Role, TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";



export async function GET(
    req: NextRequest
) {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!authToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(authToken);

    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!GetUser.doesUserExistByEmail(payload.email)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    };

    if ((payload as any).role !== Role.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


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