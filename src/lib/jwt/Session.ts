
import { verifyJsonWebtoken } from "./Jwt";
import { Role } from "@prisma/client";

export async function getCurrentUserIdFromToken(
    token?: string | null
) {
    try {
        if (!token) {
            return null;
        }

        const decoded = (await verifyJsonWebtoken(token)) as unknown as {
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
        const decoded = (await verifyJsonWebtoken(token)) as unknown as {
            userId: string;
            role: Role;
        };
        return !!decoded.userId;
    } catch (error) {
        return false;
    }
}