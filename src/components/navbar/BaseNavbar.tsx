'use client';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/Logo.svg";
interface NavbarProps {
    buttonText: string;
    buttonHref: string;
}

const Navbar: React.FC<NavbarProps> = (
    { buttonText, buttonHref }
) => {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0d0d0d]/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 xl:px-10 py-3 flex flex-row justify-between items-center">

                <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity duration-150">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={100}
                        height={100}
                        className="rounded-sm"
                    />
                </Link>

                {/* Dynamisk Knap */}
                <Link
                    href={buttonHref}
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors duration-150 shadow-[0_0_16px_rgba(59,130,246,0.25)]"
                >
                    {buttonText}
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;