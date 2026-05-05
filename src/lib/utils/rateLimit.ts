import prisma from "@/lib/prisma";

type RateLimitConfig = {
    limit: number;
    windowMs: number;
    blockMs: number;
};

function formatWaitTime(ms: number): string {
    const totalSeconds = Math.max(1, Math.ceil(ms / 1000));

    if (totalSeconds < 60) {
        return `${totalSeconds} sekunder`;
    }

    const minutes = Math.ceil(totalSeconds / 60);
    return `${minutes} minutter`;
}

export async function enforceRateLimit(key: string, config: RateLimitConfig) {
    const now = new Date();
    const record = await prisma.loginRateLimit.findUnique({
        where: { key },
    });

    if (!record) {
        await prisma.loginRateLimit.upsert({
            where: { key },
            update: {
                count: 1,
                windowStart: now,
                blockedUntil: null,
            },
            create: {
                key,
                count: 1,
                windowStart: now,
            },
        });
        return;
    }

    if (record.blockedUntil && record.blockedUntil > now) {
        const waitTime = record.blockedUntil.getTime() - now.getTime();
        throw new Error(`For mange forsøg. Prøv igen om ${formatWaitTime(waitTime)}.`);
    }

    const windowAge = now.getTime() - record.windowStart.getTime();

    if (windowAge >= config.windowMs) {
        await prisma.loginRateLimit.update({
            where: { key },
            data: {
                count: 1,
                windowStart: now,
                blockedUntil: null,
            },
        });
        return;
    }

    const nextCount = record.count + 1;

    if (nextCount > config.limit) {
        const blockedUntil = new Date(now.getTime() + config.blockMs);

        await prisma.loginRateLimit.update({
            where: { key },
            data: {
                count: nextCount,
                blockedUntil,
            },
        });

        throw new Error(`For mange forsøg. Prøv igen om ${formatWaitTime(config.blockMs)}.`);
    }

    await prisma.loginRateLimit.update({
        where: { key },
        data: {
            count: nextCount,
        },
    });
}