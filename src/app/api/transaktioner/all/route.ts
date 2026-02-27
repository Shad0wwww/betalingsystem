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

        // Henter data fra Invoice-tabellen
        const allTransactions = await prisma.$queryRaw`
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