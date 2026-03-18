import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { checkAuthentication, SESSION_COOKIE_NAME } from "./lib/session/Session";

const locales = ["en-US", "da-DK", "de-DE"];
const defaultLocale = "da-DK";

function getLocale(request: NextRequest) {
    const headers = {
        "accept-language": request.headers.get("accept-language") || "",
    };
    const languages = new Negotiator({ headers }).languages();
    return match(languages, locales, defaultLocale);
}

export default async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (!pathnameHasLocale) {
        const locale = getLocale(request);
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname === "/" ? "" : pathname}${search}`,
                request.url,
            ),
        );
    }

    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const isAuthenticated = sessionToken ? await checkAuthentication(sessionToken) : false;
    const isLoginOrSignup = pathname.match(/\/(login|signup)$/);
    const isDashboard = pathname.includes("/dashboard");

    if (isDashboard && !isAuthenticated) {
        const redirectUrl = new URL("/login", request.url);
        const response = NextResponse.redirect(redirectUrl);
        if (sessionToken) response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
    }

    if (isAuthenticated && isLoginOrSignup) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
