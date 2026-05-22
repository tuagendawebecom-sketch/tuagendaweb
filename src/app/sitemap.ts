import type { MetadataRoute } from "next";
import { demoCategories, siteUrl } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/privacidad", "/terminos"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.45
  }));

  const demoRoutes = demoCategories.map((demo) => ({
    url: `${siteUrl}/demos/${demo.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.55
  }));

  return [...staticRoutes, ...demoRoutes];
}
