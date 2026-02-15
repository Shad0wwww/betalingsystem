"use client";


import { usePathname } from 'next/navigation';
import Navbar from './BaseNavbar';
import DashboardNavbar from './DashboardNavbar';


export default function ChooseNavbar() {
    const path = usePathname();

    if (path === "/") {
        return <Navbar buttonText="Login" buttonHref="/login" />;
    } 

    if (path === "/login") {
        return <Navbar buttonText="Sign Up" buttonHref="/signup" />;
    }

    if (path === "/signup") {
        return <Navbar buttonText="Login" buttonHref="/login" />;
    }

    if (path.startsWith("/dashboard")) {
        return <DashboardNavbar />;
    }

    return <Navbar buttonText="Home" buttonHref="/" />;
}