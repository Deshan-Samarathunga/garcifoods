import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", "/products", "/contact"].map((path) => ({
    url: `${env.siteUrl}${path}`,
    lastModified: new Date(),
  }));
}
