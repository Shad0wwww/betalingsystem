import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    try {

        const deleted = await prisma.invoice.deleteMany({
            where: {
                createdAt: {
                    lt: fiveYearsAgo,
                },
            },
        });

        NextResponse.json({ message: `Deleted ${deleted.count} old receipts.` });

    } catch (error) {
        console.error("Error cleaning up receipts:", error);
        return new Response("Internal Server Error", { status: 500 });
    }


}
