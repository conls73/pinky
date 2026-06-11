import { Lead } from "@/types";
import { JobSource, JobSourceQuery } from "./types";

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export const thumbtackFallback: JobSource = {
  name: "Thumbtack (Scraper)",
  isConfigured() {
    return true;
  },
  async search({ query, params, limit }: JobSourceQuery): Promise<Lead[]> {
    if (params.remote) return []; // Thumbtack is generally for local services
    
    const location = [params.city, params.state].filter(Boolean).join(", ");
    const zipCode = params.zipCode || "";
    
    const u = new URL("https://www.thumbtack.com/k");
    u.searchParams.set("q", query);
    if (zipCode) {
      u.searchParams.set("zip_code", zipCode);
    } else if (location) {
      u.searchParams.set("location", location);
    }

    try {
      const res = await fetch(u.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (!res.ok) {
        console.warn(`[thumbtackScraper] ${res.status}`);
        return [];
      }
      
      const html = await res.text();
      const leads: Lead[] = [];

      const regex = /<a[^>]+href="([^"]+)"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>/gis;
      let match;
      while ((match = regex.exec(html)) !== null && leads.length < limit) {
        const url = match[1];
        let title = match[2].replace(/<[^>]+>/g, "").trim();
        title = decodeEntities(title);
        
        if (title && url && (url.startsWith("/") || url.startsWith("https://www.thumbtack.com"))) {
          leads.push({
            id: `thumbtack-fb-${leads.length}-${title.slice(0, 20)}`,
            title,
            source: "Thumbtack",
            location: location,
            url: url.startsWith("/") ? `https://www.thumbtack.com${url}` : url,
            snippet: "Service gig from Thumbtack.",
          });
        }
      }

      return leads;
    } catch (err) {
      console.warn("[thumbtackScraper] failed", err);
      return [];
    }
  },
};
