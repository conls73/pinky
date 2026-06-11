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

export const monsterFallback: JobSource = {
  name: "Monster (Scraper)",
  isConfigured() {
    return true;
  },
  async search({ query, params, limit }: JobSourceQuery): Promise<Lead[]> {
    const location = [params.city, params.state].filter(Boolean).join(", ");
    const u = new URL("https://www.monster.com/jobs/search");
    u.searchParams.set("q", query);
    if (location && !params.remote) {
      u.searchParams.set("where", location);
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
        console.warn(`[monsterScraper] ${res.status}`);
        return [];
      }
      
      const html = await res.text();
      const leads: Lead[] = [];

      const regex = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*job-card-title[^"]*"[^>]*>(.*?)<\/a>/gis;
      let match;
      while ((match = regex.exec(html)) !== null && leads.length < limit) {
        const url = match[1];
        let title = match[2].replace(/<[^>]+>/g, "").trim();
        title = decodeEntities(title);
        
        if (title) {
          leads.push({
            id: `monster-fb-${leads.length}-${title.slice(0, 20)}`,
            title,
            source: "Monster",
            location: location,
            url,
            snippet: "Job listing from Monster — open the listing for full details.",
          });
        }
      }

      return leads;
    } catch (err) {
      console.warn("[monsterScraper] failed", err);
      return [];
    }
  },
};
