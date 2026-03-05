
import ChooseNavbar from "@/components/navbar/NavbarChoser";
import "./globals.css";
import Logo from "@/../public/Logo.svg";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/footer/footer";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from '@next/third-parties/google'
import { CookiesProvider } from "next-client-cookies/server";

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
	description: "Betalingssystem for Kammerslusen Ribe (KUN SKOLEPROJEKT)",
	keywords: ["Ribe Sejlklub", "Kammerslusen Ribe", "Betalingssystem", "Sejlklub", "Ribe"],
	robots: "index, follow",
	openGraph: {
		title: "Ribe Sejlklub",
		description: "Betalingssystem for Kammerslusen Ribe (KUN SKOLEPROJEKT) FIKTIV WEBSITE",
		url: "https://pins.dk",
		siteName: "Ribe Sejlklub",
		images: [
			{
				url: Logo.src,
				width: 800,
				height: 600,
				alt: "Ribe Sejlklub Logo",
			},
		],
		type: "website",
	},
	icons: {
		icon: Logo.src,
	},
	verification: {
		google: process.env.GOOGLE_SITE_VERIFICATION || "",
	},
	metadataBase: new URL("https://pins.dk"),
	
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
				<CookiesProvider >
					<ChooseNavbar />
					{children}
					<Toaster position="top-center" />
					<GoogleAnalytics gaId="G-ZZC8062EPQ" />
					<Footer params={params} />
				</CookiesProvider>
				
			</body>
		</html>
	);
}
