"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    links: { href: string; label: string }[];
};

export default function NavLinks({ links }: NavLinkProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-row pt-1 sub-headline gap-3">
            {links.map((link) => {
             
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-5 py-1 hover:border-b-2 hover:border-white/20 ${isActive ? "border-b-2 border-blue-400 font-semibold text-white" : "text-gray-400"
                            }`}
                    >
                        <div className="pb-1">
                            <p>{link.label}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}