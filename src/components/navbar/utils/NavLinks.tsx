"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    links: { href: string; label: string }[];
};

export default function NavLinks({ links }: NavLinkProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-row gap-1">
            {links.map((link) => {
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`relative px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                            isActive
                                ? "text-white"
                                : "text-white/40 hover:text-white/75"
                        }`}
                    >
                        {link.label}
                        {/* Animated underline */}
                        <span
                            className={`absolute bottom-0 left-0 h-[2px] w-full rounded-full transition-all duration-200 ${
                                isActive
                                    ? "bg-blue-500 opacity-100 scale-x-100"
                                    : "bg-white/20 opacity-0 scale-x-0"
                            } origin-center group-hover:opacity-100 group-hover:scale-x-100`}
                        />
                    </Link>
                );
            })}
        </div>
    );
}