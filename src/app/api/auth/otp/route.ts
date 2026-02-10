import { generateJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { verifyOTPCode } from "@/lib/utils/OTP";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest
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

    const user = await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            id: true
        }
    });

    const token = await generateJsonWebtoken(
        user?.id.toString()!!,
        email
    )

    await prisma.verificationToken.deleteMany({
        where: {
            identifier: email
        }
    });

    console.log("Generated JWT token:", token);



    const response = NextResponse.json(
        { message: "OTP verified successfully",
            token: token
         }
        , { status: 200 },
        
    );

    
    return response;
}

function isExpired(
    expires: Date
): boolean {
    const tenMinutes = 10 * 60 * 1000;
    const now = new Date().getTime();

    return (now - expires.getTime()) > tenMinutes;
}