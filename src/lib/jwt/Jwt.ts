

import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getCookies } from "next-client-cookies/server";

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
        const cookies = await getCookies();
        const token = cookies.get("token");

        const decoded = await verifyJsonWebtoken(token!) as unknown as {
            userId: string
            role: Role
        };
        return decoded;
    } catch (error) {
        return null;
    }
}