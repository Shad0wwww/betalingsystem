import { validateSession, SESSION_COOKIE_NAME } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { ActionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { name, model } = await req.json();

    if (!name || !model) {
        return NextResponse.json({ message: "Name and model are required." }, { status: 400 });
    }

    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await validateSession(sessionToken);

    if (!user) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!(await GetUser.doesUserExistByEmail(user.email))) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name.length > 50 || model.length > 50) {
        return NextResponse.json({ message: "Name and model must be less than 50 characters." }, { status: 400 });
    }

    const existingBoats = await prisma.boat.count({
        where: { userId: user.userId },
    });

    if (existingBoats >= 2) {
        return NextResponse.json({ message: "Boat limit reached. You can only register up to 2 boats." }, { status: 400 });
    }

    await prisma.boat.create({
        data: {
            kaldeNavn: name,
            skibModel: model,
            userId: user.userId,
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: user.userId,
            action: ActionType.BOAT_ADDED,
            details: `User registered a boat named ${name} with model ${model}`,
        },
    });

    return NextResponse.json({ message: "Boat registered successfully!", status: 200 });
}
