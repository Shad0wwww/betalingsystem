'use server';

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session/Session";

export async function markWarningAsRead(warningId: number) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        // Verify warning belongs to user
        const warning = await prisma.userWarning.findUnique({
            where: { id: warningId },
        });

        if (!warning || warning.userId !== user.userId) {
            throw new Error("Warning not found");
        }

        // Mark as read
        await prisma.userWarning.update({
            where: { id: warningId },
            data: { isRead: true },
        });

        return { success: true };
    } catch (error) {
        console.error("Error marking warning as read:", error);
        throw error;
    }
}
