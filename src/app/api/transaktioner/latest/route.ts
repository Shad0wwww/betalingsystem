import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const cookieStore = await cookies();
	const authToken = cookieStore.get("auth_token");

	if (!authToken) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const verifyJWTToken = await verifyJsonWebtoken(authToken.value);

	if (!verifyJWTToken) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { userId, email } = verifyJWTToken as unknown as {
		userId: string;
		email: string;
	};

	const findLatestTransactions = await prisma.transaction.findMany({
		where: { userId: userId },
		orderBy: { createdAt: "desc" },
		take: 2,
	});

	return NextResponse.json(findLatestTransactions);
}
