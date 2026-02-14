'use client';
import React from "react";
import Link from "next/link";

interface NavbarProps {
    buttonText: string;
    buttonHref: string;
}

const Navbar: React.FC<NavbarProps> = ({ buttonText, buttonHref }) => {
    return (
        <nav className="bg-[#131212] border-b border-[#383636] w-full">
            <div className="mx-auto container lg:max-w-7xl px-[5%] py-7 flex flex-row justify-between items-center headline-color">

                {/* Logo / Titel */}
                <div className="flex items-center gap-3">
                    <h1 className="font-bold text-base text-white">
                        Ribe Sejlklub - Betaling
                    </h1>
                </div>

                {/* Dynamisk Knap */}
                <div className="flex items-center gap-3">
                    <Link
                        href={buttonHref}
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
                        {buttonText}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;