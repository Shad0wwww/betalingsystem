"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session/Session";
import { ActionType } from "@prisma/client";

async function getAuthPayload(): Promise<{ userId: string; email: string }> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return { userId: user.userId, email: user.email };
}

export async function updateBoatName(boatId: number, name: string) {
    if (!Number.isInteger(boatId) || boatId <= 0) throw new Error("Invalid boat id");
    if (!name || typeof name !== "string") throw new Error("Invalid name");

    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("Name is required");
    if (trimmedName.length > 50) throw new Error("Name must be less than 50 characters");

    const { userId } = await getAuthPayload();

    const boat = await prisma.boat.findFirst({
        where: { id: boatId, userId },
        select: { id: true },
    });
    if (!boat) throw new Error("Boat not found");

    const updatedBoat = await prisma.boat.update({
        where: { id: boatId },
        data: { kaldeNavn: trimmedName },
        select: { id: true, kaldeNavn: true },
    });

    return { id: updatedBoat.id, name: updatedBoat.kaldeNavn };
}

export async function createBoat(name: string, model: string) {
    if (!name || typeof name !== "string") throw new Error("Name is required");
    if (!model || typeof model !== "string") throw new Error("Model is required");

    const trimmedName = name.trim();
    const trimmedModel = model.trim();

    if (!trimmedName || !trimmedModel) throw new Error("Name and model are required");
    
    if (trimmedName.length > 50 || trimmedModel.length > 50) {
        throw new Error("Name and model must be less than 50 characters");
    }

    const { userId } = await getAuthPayload();

    const existingBoats = await prisma.boat.count({
        where: { userId },
    });

    if (existingBoats >= 2) {
        throw new Error("Boat limit reached. You can only register up to 2 boats.");
    }

    const createdBoat = await prisma.boat.create({
        data: {
            kaldeNavn: trimmedName,
            skibModel: trimmedModel,
            userId,
        },
        select: {
            id: true,
            kaldeNavn: true,
            skibModel: true,
        },
    });

    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.BOAT_ADDED,
            details: `User registered a boat named ${trimmedName} with model ${trimmedModel}`,
        },
    });

    return {
        id: createdBoat.id,
        name: createdBoat.kaldeNavn,
        model: createdBoat.skibModel,
    };
}

export async function deleteBoat(boatId: number) {
    if (!Number.isInteger(boatId) || boatId <= 0) throw new Error("Invalid boat id");

    const { userId } = await getAuthPayload();

    const boat = await prisma.boat.findFirst({
        where: { id: boatId, userId },
        select: { id: true, kaldeNavn: true },
    });
    if (!boat) throw new Error("Boat not found");

    const activeSession = await prisma.meterSession.findFirst({
        where: { boatId, isActive: true },
        select: { id: true },
    });
    if (activeSession) throw new Error("Boat has an active session");

    try {
        await prisma.boat.delete({ where: { id: boatId } });
    } catch {
        throw new Error("Boat cannot be deleted because it is linked to existing history");
    }

    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.BOAT_REMOVED,
            details: `User removed a boat named ${boat.kaldeNavn}`,
        },
    });

    return { success: true };
}
