import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.absmach.eu/docs/hardware";
const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

function toSiteUrl(path: string): string {
  const url = `${normalizedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  return url.endsWith("/") ? url : `${url}/`;
}

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: toSiteUrl(page.url),
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}
