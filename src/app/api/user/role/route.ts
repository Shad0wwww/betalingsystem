import { GetUser } from "@/lib/users/GetUser";

import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest
) {


    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const {
            userId,
        } = await verifyJsonWebtoken(cookie) as unknown as {
            userId: string
        };

        if (!userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userRole = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                role: true,
            }
        });
        return NextResponse.json(userRole);
        
    } catch (error) {
        console.error("Error verifying token:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    

   
    
}