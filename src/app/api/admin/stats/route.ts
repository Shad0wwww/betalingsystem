import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function monthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthRange(months = 12) {
    const result: string[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push(monthKey(d));
    }
    return result;
}

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [paidInvoices, completedSessions, newUsers] = await Promise.all([
        prisma.invoice.findMany({
            where: { status: "PAID", paidAt: { gte: since } },
            select: { amount: true, paidAt: true, type: true },
        }),
        prisma.meterSession.findMany({
            where: { isActive: false, endValue: { not: null }, startTime: { gte: since } },
            select: { startValue: true, endValue: true, startTime: true, type: true },
        }),
        prisma.user.findMany({
            where: { createdAt: { gte: since } },
            select: { createdAt: true },
        }),
    ]);

    const months = buildMonthRange(12);

    const incomeMap: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    for (const inv of paidInvoices) {
        const key = monthKey(new Date(inv.paidAt!));
        if (key in incomeMap) incomeMap[key] += inv.amount / 100;
    }

    const electricityMap: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    const waterMap: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    for (const s of completedSessions) {
        const key = monthKey(new Date(s.startTime));
        const consumption = (s.endValue ?? s.startValue) - s.startValue;
        if (key in electricityMap) {
            if (s.type === "ELECTRICITY") electricityMap[key] += consumption;
            else waterMap[key] += consumption;
        }
    }

    const usersMap: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    for (const u of newUsers) {
        const key = monthKey(new Date(u.createdAt));
        if (key in usersMap) usersMap[key]++;
    }

    const monthlyData = months.map((m) => {
        const [year, month] = m.split("-");
        const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("da-DK", {
            month: "short",
            year: "2-digit",
        });
        return {
            month: m,
            label,
            income: Math.round(incomeMap[m] * 100) / 100,
            electricity: Math.round(electricityMap[m] * 100) / 100,
            water: Math.round(waterMap[m] * 100) / 100,
            newUsers: usersMap[m],
        };
    });

    const totalIncome = monthlyData.reduce((acc, m) => acc + m.income, 0);
    const totalElectricity = monthlyData.reduce((acc, m) => acc + m.electricity, 0);
    const totalWater = monthlyData.reduce((acc, m) => acc + m.water, 0);
    const totalNewUsers = monthlyData.reduce((acc, m) => acc + m.newUsers, 0);
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
        monthlyData,
        totals: {
            income: Math.round(totalIncome * 100) / 100,
            electricity: Math.round(totalElectricity * 100) / 100,
            water: Math.round(totalWater * 100) / 100,
            newUsers: totalNewUsers,
            totalUsers,
        },
    });
}
