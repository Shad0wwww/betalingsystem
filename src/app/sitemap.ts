import { MetadataRoute } from "next";

const locales = ["da", "en", "de"];
const baseUrl = "https://pins.dk";

const pages = [
    { path: "", changeFrequency: "yearly" as const, priority: 1 },
    { path: "/dashboard", changeFrequency: "monthly" as const, priority: 0.8 },
    {
        path: "/terms-of-service",
        changeFrequency: "yearly" as const,
        priority: 0.5,
    },
    {
        path: "/privacy-policy",
        changeFrequency: "yearly" as const,
        priority: 0.5,
    },
    { path: "/login", changeFrequency: "yearly" as const, priority: 0.6 },
    { path: "/signup", changeFrequency: "yearly" as const, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    return locales.flatMap((locale) =>
        pages.map(({ path, changeFrequency, priority }) => ({
            url: `${baseUrl}/${locale}${path}`,
            lastModified: new Date(),
            changeFrequency,
            priority,
        })),
    );
}
