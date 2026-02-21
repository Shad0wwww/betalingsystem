
import ChooseNavbar from "@/components/navbar/NavbarChoser";
import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/footer/footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Ribe Sejlklub",
	description: "Betalingssystem for Kammerslusen Ribe",
};

type LayoutProps = Readonly<{
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}>;

export default function RootLayout(
	{ children, params }: LayoutProps
) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ChooseNavbar />
				{children}
				<Footer params={params} />
			</body>
		</html>
	);
}
