'use client';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import logo from "../../../public/Logo.svg";
const DashboardNavbar: React.FC = () => {
    const handleLogout = async () => {
   
        await fetch("/api/user/logud").then((res) => {
            redirect("/login");
        });
    

        
    };
    
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0d0d0d]/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 xl:px-10 py-3 flex flex-row justify-between items-center">

                {/* Logo */}
                <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity duration-150">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={88}
                        height={88}
                        className="rounded-sm"
                    />
                </Link>

                {/* Log ud */}
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/[0.15] border border-white/10 text-white/80 hover:text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors duration-150"
                >
                    Log ud
                </button>
            </div>
        </nav>
    );
};

export default DashboardNavbar;