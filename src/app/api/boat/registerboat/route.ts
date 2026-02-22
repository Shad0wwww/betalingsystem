import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { NextRequest, NextResponse } from "next/server";



export async function POST(
    req: NextRequest
) {

    const { name, model } = await req.json();

    if (!name || !model) {
        return NextResponse.json({ message: "Name and model are required." }, { status: 400 });
    }

    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(cookie);

    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!GetUser.doesUserExistByEmail(payload.email)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name.length > 50 || model.length > 50) {
        return NextResponse.json({ message: "Name and model must be less than 50 characters." }, { status: 400 });
    }

    const existingBoats = await prisma.boat.count({
        where: {
            user: { email: payload.email }
        }
    });

    if (existingBoats >= 2) {
        return NextResponse.json({ message: "Boat limit reached. You can only register up to 2 boats." }, { status: 400 });
    }

    await prisma.boat.create({
        data: {
            kaldeNavn: name,
            skibModel: model,
            user: {
                connect: { email: payload.email }
            }
        },
    })


    return NextResponse.json({ message: "Boat registered successfully!", status: 200 });
}