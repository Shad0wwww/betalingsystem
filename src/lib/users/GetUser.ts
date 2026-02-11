import { verifyJsonWebtoken } from "../jwt/Jwt";
import prisma from "../prisma";


export class GetUser {
    static async byId(
        userId: number
    ) {
        return prisma.user.findUnique({
            where: { id: userId },
        });
    }

    static async byEmail(
        email: string
    ) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    static async getUserFromJsonWebToken(
        token: string
    ) {
        const decodedToken = await verifyJsonWebtoken(token) as unknown as { 
            userId: number 
        };
        return await this.byId(decodedToken.userId);

    }

}