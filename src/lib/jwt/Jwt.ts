// src/lib/jwt/Jwt.ts
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

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

export async function verifyJsonWebtoken(token: string) {
    return jwt.verify(
        token,
        process.env.JWT_SECRET as string
    );
}