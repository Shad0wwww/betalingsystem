import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.discordapp.com",
				port: "",
				pathname: "/avatars/**",
			},
			{
				protocol: "https",
				hostname: "cdn.discordapp.com",
				port: "",
				pathname: "/embed/avatars/**",
			},
			{
				protocol: "https",
				hostname: "cdn.discordapp.com",
				port: "",
				pathname: "/attachments/**",
			},
			{
				protocol: "https",
				hostname: "media.discordapp.net",
				port: "",
				pathname: "/attachments/**",
			},
		],
	},
};

export default nextConfig;
