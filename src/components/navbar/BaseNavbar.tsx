'use client';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/Logo.png";
interface NavbarProps {
    buttonText: string;
    buttonHref: string;
}

const Navbar: React.FC<NavbarProps> = (
    { buttonText, buttonHref }
) => {
    return (
        <nav className="bg-[#0d0d0d] border-b border-[#383636] w-full">
            <div className="mx-auto container lg:max-w-7xl px-[5%] py-4 flex flex-row justify-between items-center headline-color">


                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Image
                            src={logo}
                            alt="Logo"
                            width={100}
                            height={100}    
                            className="rounded-sm"
                        />
                    </Link>
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