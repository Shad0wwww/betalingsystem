import prisma from "@/lib/prisma";
import { UtilityType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
 
    return NextResponse.json("Hejsa")
}