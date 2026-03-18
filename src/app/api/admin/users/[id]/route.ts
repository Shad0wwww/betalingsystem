import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            phoneCountry: true,
            role: true,
            reservedBalance: true,
            stripeCustomerId: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    boats: true,
                    invoices: true,
                    transactions: true,
                    meterSessions: true,
                    auditLogs: true,
                },
            },
        },
    });

    if (!user) return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });

    return NextResponse.json({ user });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { id } = await params;

    const { name, email, phone, phoneCountry, role } = await req.json();

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
        return NextResponse.json({ error: "Navn, email og telefon er påkrævet" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });

    if (email !== existing.email) {
        const conflict = await prisma.user.findUnique({ where: { email } });
        if (conflict) return NextResponse.json({ error: "Email er allerede i brug" }, { status: 400 });
    }
    if (phone !== existing.phone) {
        const conflict = await prisma.user.findUnique({ where: { phone } });
        if (conflict) return NextResponse.json({ error: "Telefonnummer er allerede i brug" }, { status: 400 });
    }

    const updated = await prisma.user.update({
        where: { id },
        data: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            phoneCountry: phoneCountry?.trim() || existing.phoneCountry,
            role: role ?? existing.role,
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: result.user.userId,
            action: ActionType.ROLE_CHANGED,
            details: `Admin opdaterede bruger ${id}: name=${name}, email=${email}, phone=${phone}, role=${role}`,
        },
    });

    return NextResponse.json({ user: updated });
}
