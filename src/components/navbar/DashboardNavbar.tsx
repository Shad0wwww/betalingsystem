'use client';
import React from "react";
import Link from "next/link";
import Image from "next/image";

const DashboardNavbar: React.FC = () => {
    return (
        <nav className="bg-[#0d0d0d] border-b border-[#383636] w-full">
            <div className="mx-auto container lg:max-w-7xl px-[5%] py-7 flex flex-row justify-between items-center headline-color">

                {/* Logo / Titel */}
                <div className="flex items-center gap-3">
                    <Image
                        src="https://github.com/Shad0wwww/betalingsystem/blob/main/public/Logo.png?raw=true"
                        alt="Logo"
                        width={30}
                        height={30}
                    />
                </div>

                {/* Dynamisk Knap */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="
                            inline-flex items-center justify-center
                            bg-[#1a1a1a] text-white 
                            px-8 py-2 rounded-2xl 
                            text-lg font-medium 
                            transition-all duration-200 
                            hover:bg-[#252525] hover:scale-[1.02] 
                            active:scale-[0.98] 
                            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black
                            shadow-lg
                        "
                    >
                        Log ud
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;