import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.absmach.eu/docs/hardware";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}
