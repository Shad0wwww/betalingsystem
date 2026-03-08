
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
	title: {
		default: "Ribe Sejlklub — Betalingsportal",
		template: "%s | Ribe Sejlklub",
	},
	description: "Ribe Sejlklubs skole projekt betalingsportal til Kammerslusen. Book, betal og administrér din bådplads hurtigt og sikkert. (VIGTIGT IKKE DEN RIGTIGE HJEMMESIDE SKOLE PROJEKT)",
	keywords: [
		"Ribe Sejlklub", "Kammerslusen Ribe", "bådplads betaling",
		"sejlklub portal", "Ribe havn", "el til båd", "marina Ribe",
	],
	authors: [{ name: "Ribe Sejlklub", url: "https://pins.dk" }],
	creator: "Ribe Sejlklub",
	robots: {
		index: true,
		follow: true,
		googleBot: { index: true, follow: true },
	},
	openGraph: {
		title: "Ribe Sejlklub — Betalingsportal",
		description: "Book, betal og administrér din bådplads ved Kammerslusen i Ribe. Hurtigt, sikkert og nemt.",
		url: "https://pins.dk",
		siteName: "Ribe Sejlklub",
		images: [
			{
				url: Logo.src,
				width: 1200,
				height: 630,
				alt: "Ribe Sejlklub — Betalingsportal",
			},
		],
		locale: "da_DK",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Ribe Sejlklub — Betalingsportal",
		description: "Book, betal og administrér din bådplads ved Kammerslusen i Ribe.",
		images: [Logo.src],
	},
	icons: {
		icon: Logo.src,
		shortcut: Logo.src,
		apple: Logo.src,
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
				className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
			>
				<CookiesProvider >
					<ChooseNavbar />
					<main className="flex-1">
						{children}
					</main>
					<Toaster position="top-center" />
					<GoogleAnalytics gaId="G-4BWD2KMZCY" />
					<Footer params={params} />
				</CookiesProvider>
				
			</body>
		</html>
	);
}
