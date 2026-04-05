import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logs/auditlogger";
import { sendEmail } from "@/lib/emailer/Mail";
import { generateWarningEmailContent } from "@/lib/emailer/MailWarning";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { id: userId } = await params;
    const body = await req.json();
    const message = body.message?.trim();

    // Validate input
    if (!message) {
        return NextResponse.json(
            { error: "Advarselbesked er påkrævet" },
            { status: 400 }
        );
    }

    if (message.length > 2000) {
        return NextResponse.json(
            { error: "Advarselbesked må maks være 2000 tegn" },
            { status: 400 }
        );
    }

    // Find the user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
    });

    if (!user) {
        return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
    }

    // Get admin name for email
    const adminUser = await prisma.user.findUnique({
        where: { id: result.user.userId },
        select: { name: true },
    });

    const adminName = adminUser?.name || "Administrator";

    // Create warning record
    const warning = await prisma.userWarning.create({
        data: {
            userId,
            message,
        },
    });

    // Send email
    try {
        const html = generateWarningEmailContent(adminName, message);
        await sendEmail(user.email, "Advarsel fra Ribe Sejlklub", html);
    } catch (error: any) {
        console.error("Failed to send warning email:", error);
        // Don't fail the request if email fails - warning record is still created
    }

    // Log the action
    await log(
        ActionType.ADMIN_ACTION,
        result.user.userId,
        `Admin sendte advarsel til bruger ${user.name} (${user.email}). Besked: "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`,
    );

    return NextResponse.json({
        warning,
        message: "Advarsel sendt til bruger",
    });
}
