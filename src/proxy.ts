import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { checkAuthentication } from "./lib/jwt/Jwt";

const locales = ["en-US", "da-DK"];
const defaultLocale = "da-DK";

function getLocale(request: NextRequest) {
    const headers = {
        "accept-language": request.headers.get("accept-language") || "",
    };
    const languages = new Negotiator({ headers }).languages();
    return match(languages, locales, defaultLocale);
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (!pathnameHasLocale) {
        const locale = getLocale(request);
        return NextResponse.redirect(
            new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url),
        );
    }

    const token = request.cookies.get("auth_token")?.value;
    const isAuthenticated = token ? await checkAuthentication(token) : false;

    const isLoginOrSignup = pathname.match(/\/(login|signup)$/);
    const isDashboard = pathname.includes("/dashboard");

    if (isAuthenticated && isLoginOrSignup) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!isAuthenticated && isDashboard) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
