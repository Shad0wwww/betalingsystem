import prisma from "@/lib/prisma";
import { verifyOTPCode } from "@/lib/utils/OTP";

export async function POST(
    request: Request
) {

    const {
        code,
        email
    } = await request.json();


    if (!code || code.length !== 6) {
        return Response.json(
            { error: "Invalid code" }
            , { status: 400 }
        );
    }

    const storedToknen = await prisma.verificationToken.findUnique({
        where: {
            identifier: email
        },
        select: {
            token: true,
            expires: true,
        }
    });

    if (!storedToknen) {
        return Response.json(
            { error: "No OTP found for this email" }
            , { status: 400 }
        );
    }

    if (isExpired(storedToknen.expires)) {
        return Response.json(
            { error: "OTP code has expired" }
            , { status: 400 }
        );
    }

    const isValid = await verifyOTPCode(
        code,
        storedToknen.token
    )

    if (!isValid) {
        return Response.json(
            { error: "Invalid OTP code" }
            , { status: 400 }
        );
    }

    await prisma.verificationToken.deleteMany({
        where: {
            identifier: email
        }
    });

    return Response.json({ success: true });


}

function isExpired(
    expires: Date
): boolean {
    const tenMinutes = 10 * 60 * 1000;
    const now = new Date().getTime();

    return (now - expires.getTime()) > tenMinutes;
}