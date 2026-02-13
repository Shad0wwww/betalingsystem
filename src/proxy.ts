import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { checkAuthentication } from "./lib/jwt/Jwt";

export default async function proxy(
    request: NextRequest
) {
    const token = request.cookies.get("auth_token")?.value as string | undefined;

    const redirectURL = request.nextUrl.clone();
    redirectURL.pathname = "/login";
    
    if (!token) {
        return NextResponse.redirect(redirectURL);
    }

    console.log("Token from cookie:", token);

    if (!(await checkAuthentication(token))) {
        console.error("Authentication failed for token:", token);
        return NextResponse.redirect(redirectURL);
    }


    

    return NextResponse.next();
}

export const config = {
    matcher: [{
        source: "/dashboard/:path*",
    }],
};