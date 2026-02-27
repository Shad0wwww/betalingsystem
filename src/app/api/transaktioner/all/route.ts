import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const authToken = request.headers.get("authorization")?.replace("Bearer ", "");

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

        // Vi bruger Prisma's $queryRaw til at lave en UNION mellem de to tabeller
        const allTransactions = await prisma.$queryRaw`
            SELECT 
                'txn-' || id::text AS id,
                amount::float AS amount,
                'success' AS status,
                COALESCE("stripeSessionId", 'TXN-' || id::text) AS "kvitteringId",
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS dato,
                "createdAt" AS "rawDate",
                LOWER(type::text) AS transaktion
            FROM "Transaction"
            WHERE "userId" = ${userId}

            UNION ALL

            SELECT 
                'inv-' || id::text AS id,
                amount::float AS amount,
                CASE 
                    WHEN status = 'PAID' THEN 'success'
                    WHEN status IN ('FAILED', 'OVERDUE') THEN 'failed'
                    ELSE 'pending'
                END AS status,
                COALESCE("InvoiceNumber", 'INV-' || id::text) AS "kvitteringId",
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS dato,
                "createdAt" AS "rawDate",
                'payment' AS transaktion
            FROM "Invoice"
            WHERE "userId" = ${userId}

            ORDER BY "rawDate" DESC
        `;

        // Løser problemet hvor Prisma/Postgres returnerer BigInts, som NextResponse.json ikke kan håndtere
        const safeData = JSON.parse(
            JSON.stringify(allTransactions, (key, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );

        return NextResponse.json(safeData);

    } catch (error) {
        // Nu vil du faktisk kunne se i din terminal, PRÆCIS hvad der går galt
        console.error("Database Query Fejl:", error);
        return NextResponse.json(
            { error: "Der skete en fejl under hentning af transaktioner." }, 
            { status: 500 }
        );
    }
}