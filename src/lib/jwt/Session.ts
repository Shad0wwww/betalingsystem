// src/lib/jwt/session.ts
import { cookies } from "next/headers";
import { verifyJsonWebtoken } from "./Jwt";
import { Role } from "@prisma/client";

export async function getCurrentUserIdFromToken() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return null;
        }

        const decoded = await verifyJsonWebtoken(token) as unknown as {
            userId: string;
            role: Role;
        };
        
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function checkAuthentication(token: string) {
    try {
        const decoded = await verifyJsonWebtoken(token) as unknown as {
            userId: string;
            role: Role;
        };
        return !!decoded.userId;
    } catch (error) {
        return false;
    }   
}