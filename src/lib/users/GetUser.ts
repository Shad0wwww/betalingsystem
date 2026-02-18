import { verifyJsonWebtoken } from "../jwt/Jwt";
import prisma from "../prisma";


export class GetUser {
    static async byId(
        userId: number
    ) {
        try {
            return await prisma.user.findUnique({
                where: { id: userId },
            });
        } catch (error) {
            return null;
        }
    }

    static async byEmail(
        email: string
    ) {
        try {
            return prisma.user.findUnique({
                where: { email },
            });
        } catch (error) {
            return null;
        }
        
    }

    static async getUserFromJsonWebToken(
        token: string
    ) {
        const decodedToken = await verifyJsonWebtoken(token) as unknown as {
            userId: number
        };
        return await this.byId(decodedToken.userId);

    }

    static async doesUserExistByEmail(
        email: string
    ) {

        const user = await this.byEmail(email);
        return !!user;


    }

}