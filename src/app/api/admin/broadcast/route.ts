import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/emailer/Mail";
import { generateBroadcastEmailContent } from "@/lib/emailer/MailBroadcast";

export async function POST(req: NextRequest) {
    // 1. Valider admin session
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    // 2. Parse request body
    const { subject, body } = await req.json();

    // 3. Valider input
    if (!subject?.trim()) {
        return NextResponse.json(
            { error: "Emne er påkrævet" },
            { status: 400 }
        );
    }
    if (!body?.trim()) {
        return NextResponse.json(
            { error: "Brødtekst er påkrævet" },
            { status: 400 }
        );
    }

    if (subject.trim().length > 200) {
        return NextResponse.json(
            { error: "Emne må maks være 200 tegn" },
            { status: 400 }
        );
    }

    if (body.trim().length > 5000) {
        return NextResponse.json(
            { error: "Brødtekst må maks være 5000 tegn" },
            { status: 400 }
        );
    }

    // 4. Hent alle brugere med email
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
        },
    });

    if (users.length === 0) {
        return NextResponse.json(
            { error: "Ingen brugere at sende til" },
            { status: 400 }
        );
    }

    // 5. Generer email HTML
    const html = generateBroadcastEmailContent(subject.trim(), body.trim());

    // 6. Send emails til alle brugere
    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
    };

    for (const user of users) {
        try {
            await sendEmail(user.email, subject.trim(), html);
            results.success++;
        } catch (error: any) {
            results.failed++;
            results.errors.push(`${user.email}: ${error.message}`);
        }
    }

    // 7. Log handlingen
    await prisma.auditLog.create({
        data: {
            userId: result.user.userId,
            action: ActionType.ADMIN_ACTION,
            details: `Broadcast sendt til ${results.success} brugere. Emne: "${subject.trim()}". Fejlede: ${results.failed}`,
        },
    });

    // 8. Return resultat
    return NextResponse.json({
        message: `Broadcast sendt til ${results.success} ud af ${users.length} brugere`,
        success: results.success,
        failed: results.failed,
        total: users.length,
        errors: results.errors.length > 0 ? results.errors.slice(0, 10) : undefined,
    });
}
