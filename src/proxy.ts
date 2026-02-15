import { NextRequest, NextResponse } from "next/server";
import { checkAuthentication } from "./lib/jwt/Jwt";

export default async function middleware(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;
    const { pathname } = request.nextUrl;

    const isAuthenticated = token ? await checkAuthentication(token) : false;

    if (isAuthenticated && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    
    if (!isAuthenticated && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// Opdater matcher til at inkludere login og signup siderne
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/signup'
    ],
};