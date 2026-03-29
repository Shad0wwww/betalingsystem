"use server";

import { getCurrentUser } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import { takeMoneyUsed } from "@/lib/stripe/TakeMoneyUsed";
import { createStripePaymentSession } from "@/lib/stripe/CreateReservation";
import { GetUser } from "@/lib/users/GetUser";
import { createStripeCustomer } from "@/lib/stripe/CreateCustomer";
import { ActionType, InvoiceStatus, MeterStatus, TransactionType, UtilityType } from "@prisma/client";
import { log } from "../logs/auditlogger";
import { createStripeSession } from "../stripe/CreateSession";

const RESERVATION_AMOUNT = 20000; // in øre (200 DKK) - this is a fixed amount to ensure the user has sufficient funds reserved before starting a session. The actual amount charged will be adjusted when the session ends based on consumption.

const FALLBACK_RATE_PER_KWH = 3.0; // DKK per kWh

// ─── Auth ────────────────────────────────────────────────────────────────────

async function getAuthPayload(): Promise<{ userId: string; email: string }> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return { userId: user.userId, email: user.email };
}

// ─── User ────────────────────────────────────────────────────────────────────

export async function getMe() {
    const { userId } = await getAuthPayload();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, phone: true, reservedBalance: true },
    });
    if (!user) throw new Error("User not found");

    return user;
}

// ─── Transactions / Invoices ─────────────────────────────────────────────────

/** Returns the 2 latest non-reservation transactions for the sidebar. */
export async function getLatestTransactions() {
    const { userId } = await getAuthPayload();

    return prisma.transaction.findMany({
        where: {
            userId,
            type: { notIn: [TransactionType.RESERVED, TransactionType.RESERVATION_RELEASED] },
        },
        orderBy: { createdAt: "desc" },
        take: 2,
    });
}

/** Returns paginated invoice history. Amounts are converted from øre to kr. */
export async function getAllTransactions(page = 1, limit = 20) {
    const { userId } = await getAuthPayload();
    const offset = (page - 1) * limit;

    const [totalResult, rows] = await Promise.all([
        prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*) FROM "Invoice" WHERE "userId" = ${userId}
        `,
        prisma.$queryRaw`
            SELECT
                amount::float / 100 AS amount,
                CASE
                    WHEN status = 'PAID'                  THEN 'success'
                    WHEN status IN ('FAILED', 'OVERDUE')  THEN 'failed'
                    ELSE 'pending'
                END AS status,
                COALESCE("InvoiceNumber", 'INV-' || id::text) AS "kvitteringId",
                TO_CHAR(COALESCE("paidAt", "createdAt"), 'YYYY-MM-DD') AS dato,
                'payment' AS transaktion
            FROM "Invoice"
            WHERE "userId" = ${userId}
            ORDER BY COALESCE("paidAt", "createdAt") DESC
            LIMIT ${limit} OFFSET ${offset}
        `,
    ]);

    const total = Number(totalResult[0].count);
    // Serialize BigInt values that Prisma returns from raw queries
    const data = JSON.parse(
        JSON.stringify(rows, (_, v) => (typeof v === "bigint" ? v.toString() : v))
    );

    return { data, total, page, limit };
}

// ─── Meter readings ───────────────────────────────────────────────────────────

export async function getLatestMeterReading(meterId: number) {
    await getAuthPayload();

    const reading = await prisma.meterReading.findFirst({
        where: { meterId },
        orderBy: { date: "desc" },
        select: { value: true, date: true, spotPris: true },
    });

    return { reading: reading ?? null };
}

// ─── Meter sessions ───────────────────────────────────────────────────────────

export async function getActiveSession() {
    const { userId } = await getAuthPayload();

    const session = await prisma.meterSession.findFirst({
        where: { userId, isActive: true },
        include: {
            meter: { select: { deviceId: true, location: true, type: true } },
            boat: { select: { kaldeNavn: true, skibModel: true } },
        },
        orderBy: { startTime: "desc" },
    });

    return { session: session ?? null };
}

export async function getAvailableMeters() {
    await getAuthPayload();

    const meters = await prisma.meter.findMany({
        where: { status: MeterStatus.ONLINE },
        select: { id: true, deviceId: true, location: true, type: true },
        orderBy: { id: "asc" },
    });

    return { meters };
}

export async function createMeterSession(meterId: number, boatId: number) {
    const { userId, email } = await getAuthPayload();

    // Validate meter
    const meter = await prisma.meter.findUnique({
        where: { id: meterId },
        include: { sessions: { where: { isActive: true } } },
    });
    if (!meter) throw new Error("Måler ikke fundet");
    if (meter.status !== MeterStatus.ONLINE) throw new Error("Måleren er ikke online");
    if (meter.sessions.length > 0) throw new Error("Måleren er allerede i brug");

    // Validate boat ownership
    const boat = await prisma.boat.findFirst({ where: { id: boatId, userId } });
    if (!boat) throw new Error("Båden tilhører ikke din konto");

    // Use the latest reading as the session start value
    const latestReading = await prisma.meterReading.findFirst({
        where: { meterId },
        orderBy: { date: "desc" },
    });

    // Create the session
    const session = await prisma.meterSession.create({
        data: {
            meterId,
            userId,
            boatId,
            type: meter.type,
            startValue: latestReading?.value ?? 0,
            isActive: true,

        },
        
    });

    await prisma.meter.update({ where: { id: meterId }, data: { status: MeterStatus.INUSE } });

    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.CONNECTED_METER,
            details: `Bruger startede session på måler ${meter.id} (Båd: ${boat.kaldeNavn})`,
        },
    });

    // Create the Stripe reservation and link the resulting invoice to this session
    const result = await createStripePaymentSession({
        userId,
        email,
        amount: RESERVATION_AMOUNT,
        description: `Reservation for måler ${meter.deviceId} (Båd: ${boat.kaldeNavn})`,
        type: meter.type,
    });

    await prisma.invoice.updateMany({
        where: { userId, status: InvoiceStatus.PENDING, meterSessionId: null },
        data: { meterSessionId: session.id },
    });

    return { session, url: (result as { url: string }).url };
}

export async function stopSession(sessionId: number) {
    const { userId } = await getAuthPayload();

    // 1. Verify the session is still active (don't modify anything yet)
    const session = await prisma.meterSession.findFirst({
        where: { id: sessionId, userId, isActive: true },
    });
    if (!session) throw new Error("Aktiv session ikke fundet");

    // 2. Verify a paid reservation exists before touching any data
    const pendingInvoice = await prisma.invoice.findFirst({
        where: { userId, status: InvoiceStatus.PENDING, meterSessionId: sessionId },
        orderBy: { createdAt: "desc" },
    });
    if (!pendingInvoice?.stripePaymentIntentId) throw new Error("Kunne ikke finde en aktiv betalingsreservation");

    // 3. Calculate consumption
    const latestReading = await prisma.meterReading.findFirst({
        where: { meterId: session.meterId },
        orderBy: { date: "desc" },
        select: { value: true, spotPris: true },
    });

    await prisma.meter.update({ where: { id: session.meterId }, data: { status: MeterStatus.ONLINE } });

    const endValue   = latestReading?.value ?? session.startValue;
    const kwhUsed    = Math.max(0, endValue - session.startValue);
    const rate       = latestReading?.spotPris ?? FALLBACK_RATE_PER_KWH;
    const amountUsed = Math.round(kwhUsed * rate * 100); // in øre

    await takeMoneyUsed(userId, pendingInvoice.stripePaymentIntentId, amountUsed, pendingInvoice.amount, session.type);

    // 5. Payment captured — safely close the session
    const endTime = new Date();
    const [updated] = await Promise.all([
        prisma.meterSession.update({
            where: { id: sessionId },
            data: { isActive: false, endTime, endValue },
        }),

        log(ActionType.DISCONNECTED_METER, 
            userId, 
            `Bruger afsluttede session på måler ${session.meterId} (Båd: ${session.boatId}). Forbrug: ${kwhUsed.toFixed(3)} kWh`)
       
    ]);

    return { session: updated, kwhUsed, amountUsed };
}

// ─── Boats ────────────────────────────────────────────────────────────────────

export async function getMyBoats() {
    const { userId } = await getAuthPayload();

    return prisma.boat.findMany({
        where: { userId },
        select: { kaldeNavn: true, skibModel: true, id: true },
    });
}

// ─── Manual Stripe checkout (top-up / direct payment) ────────────────────────

export async function createStripeCheckout(amount: number, description: string, type: UtilityType) {
    const { userId, email } = await getAuthPayload();

    const user = await GetUser.byEmail(email);
    if (!user) throw new Error("User not found.");

    // Ensure the user has a Stripe customer record
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const stripeCustomer = await createStripeCustomer(user.email, user.name, user.phone);
        customerId = stripeCustomer.id;
        await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await createStripeSession(customerId, amount * 100, description, userId, type);

    await prisma.invoice.create({
        data: {
            userId,
            amount,
            type,
            stripeSessionId: session.id,
            status: InvoiceStatus.PENDING,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });


    await log(ActionType.PAYMENT_LINK_CREATED, userId, `Bruger oprettede betalingslink for ${description} med beløb ${amount}`);

    return { url: session.url };
}


