import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { Role } from "@prisma/client";
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
    const authToken =
        req.headers.get("authorization")?.replace("Bearer ", "") ??
        req.cookies.get("auth_token")?.value;

    if (!authToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJsonWebtoken(authToken);
    if (!payload || typeof payload === "string") return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    if (!GetUser.doesUserExistByEmail(payload.email)) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if ((payload as any).role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [paidInvoices, completedSessions, newUsers] = await Promise.all([
        // Paid invoices last 12 months
        prisma.invoice.findMany({
            where: { status: "PAID", paidAt: { gte: since } },
            select: { amount: true, paidAt: true, type: true },
        }),
        // Completed sessions last 12 months (has endValue so we can calc consumption)
        prisma.meterSession.findMany({
            where: { isActive: false, endValue: { not: null }, startTime: { gte: since } },
            select: { startValue: true, endValue: true, startTime: true, type: true },
        }),
        // New users last 12 months
        prisma.user.findMany({
            where: { createdAt: { gte: since } },
            select: { createdAt: true },
        }),
    ]);

    const months = buildMonthRange(12);

    // ── Income per month (øre → kroner) ──────────────────────────────
    const incomeMap: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    for (const inv of paidInvoices) {
        const key = monthKey(new Date(inv.paidAt!));
        if (key in incomeMap) incomeMap[key] += inv.amount / 100;
    }

    // ── Consumption per month per type ────────────────────────────────
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

    // ── New users per month ────────────────────────────────────────────
    const usersMap: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    for (const u of newUsers) {
        const key = monthKey(new Date(u.createdAt));
        if (key in usersMap) usersMap[key]++;
    }

    // ── Build combined monthly array ──────────────────────────────────
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

    // ── Totals ────────────────────────────────────────────────────────
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
