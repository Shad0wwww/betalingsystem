
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest
) {

    if (request.headers.get("authorization") !== process.env.API_KEY) {
        return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { stander } : { stander: string } = await request.json()

    
 
    return NextResponse.json("Hejsa")
}