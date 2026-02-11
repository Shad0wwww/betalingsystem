import { NextRequest, NextResponse } from "next/server";

export default async function proxy(
    request: NextRequest
) {
    const token = request.cookies.get("auth_token")?.value as string | undefined;
    
    if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [{
        source: "/dashboard/:path*",
        missing: [{ type: "cookie", key: "auth_token", value: "active" }]
    }],
};