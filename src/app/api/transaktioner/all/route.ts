import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const authToken =
            request.headers.get("authorization")?.replace("Bearer ", "") ??
            request.cookies.get("auth_token")?.value;

        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const verifyJWTToken = await verifyJsonWebtoken(authToken);

        if (!verifyJWTToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = verifyJWTToken as unknown as {
            userId: string;
            email: string;
        };

        const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1"));
        const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") ?? "20")));
        const offset = (page - 1) * limit;

        console.log(`Fetching transactions for userId: ${userId}, page: ${page}, limit: ${limit}`);

        const [totalResult, allTransactions] = await Promise.all([
            prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*) FROM "Invoice" WHERE "userId" = ${userId}
            `,
            prisma.$queryRaw`
                SELECT
                    amount::float AS amount,
                    CASE
                        WHEN status = 'PAID' THEN 'success'
                        WHEN status IN ('FAILED', 'OVERDUE') THEN 'failed'
                        ELSE 'pending'
                    END AS status,
                    COALESCE("InvoiceNumber", 'INV-' || id::text) AS "kvitteringId",
                    TO_CHAR(COALESCE("paidAt", "createdAt"), 'YYYY-MM-DD') AS dato,
                    'payment' AS transaktion
                FROM "Invoice"
                WHERE "userId" = ${userId}
                ORDER BY COALESCE("paidAt", "createdAt") DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
        ]);

        const total = Number(totalResult[0].count);

        const safeData = JSON.parse(
            JSON.stringify(allTransactions, (_, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );

        return NextResponse.json({ data: safeData, total, page, limit });
    } catch (error) {
        console.error("Database Query Fejl:", error);
        return NextResponse.json(
            { error: "Der skete en fejl under hentning af transaktioner." },
            { status: 500 }
        );
    }
}