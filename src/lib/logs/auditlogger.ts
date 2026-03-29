import { ActionType } from "@prisma/client";
import prisma from "../prisma";


export async function log(
    action: ActionType,
    userId: string,
    details?: string,
) {
    await prisma.auditLog.create({
        data: {
            action,
            details,
            userId
        }
    });
}