"use client";


import { useParams, usePathname } from 'next/navigation';
import Navbar from './BaseNavbar';
import DashboardNavbar from './DashboardNavbar';


export default function ChooseNavbar() {
    const path = usePathname();
    const params = useParams();
    const lang = params.lang;


    if (path === "/" || path === `/${lang}`) {
        return <Navbar buttonText="Login" buttonHref="/login" />;
    } 

    if (path === "/login" || path === `/${lang}/login`) {
        return <Navbar buttonText="Sign Up" buttonHref="/signup" />;
    }

    if (path === "/signup" || path === `/${lang}/signup`) {
        return <Navbar buttonText="Login" buttonHref="/login" />;
    }

    if (path.startsWith("/dashboard") || path.startsWith(`/${lang}/dashboard`)) {
        return <DashboardNavbar />;
    }

    return <Navbar buttonText="Home" buttonHref="/" />;
}