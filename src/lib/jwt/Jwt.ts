'use server';

import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function generateJsonWebtoken(
    userId: string,
    email: string,
    role: Role
) {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );
}

export async function verifyJsonWebtoken(
    token: string
) {
    return jwt.verify(
        token,
        process.env.JWT_SECRET as string
    )
}

export async function checkAuthentication(
    token: string
) {
    try {
        return await verifyJsonWebtoken(token);
    } catch (error) {
        return null;
    }
}

export async function getCurrentUserIdFromToken(

)  {
    try {
        const cookieStore = cookies();
        const token = (await cookieStore).get("auth_token")?.value;

        const decoded = await verifyJsonWebtoken(token!) as unknown as {
            userId: string
            role: Role
        };
        return decoded;
    } catch (error) {
        return null;
    }
}