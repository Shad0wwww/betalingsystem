import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { checkAuthentication } from "./lib/jwt/Jwt";
import { GetUser } from "./lib/users/GetUser";

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

    
    const user = token ? await GetUser.getUserFromJsonWebToken(token) : null;
    console.log("User", user);
    console.log(`Middleware: User from token: ${user ? user.email : "No user"}`);
    const userExist = await GetUser.doesUserExistByEmail(user?.email || "");

    console.log(`Middleware: isAuthenticated=${isAuthenticated}, isLoginOrSignup=${isLoginOrSignup}, isDashboard=${isDashboard}, token=${!!token}, userExist=${userExist}`);

    if (isDashboard && !isAuthenticated && !userExist) {
        if (token) {
            cookieStore.delete("auth_token");
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthenticated && isLoginOrSignup && userExist) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }


    console.log(`Middleware: Checking authentication for ${pathname}`);


    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
