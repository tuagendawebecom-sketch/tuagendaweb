import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/superadmin", "/panel", "/login"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
