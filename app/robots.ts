import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/creator/", "/admin/"],
    },
    sitemap: "https://onedollarsell.com/sitemap.xml",
  };
}
