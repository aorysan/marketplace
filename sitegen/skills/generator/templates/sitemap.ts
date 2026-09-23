import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "{{BASE_URL}}";
  // Tambahkan slug dari PAGES-LIST.md sebagai entri { url, lastModified }.
  return [{ url: `${base}/`, lastModified: new Date() }];
}
