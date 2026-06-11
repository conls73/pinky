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

export const ziprecruiterFallback: JobSource = {
  name: "ZipRecruiter (Scraper)",
  isConfigured() {
    return true;
  },
  async search({ query, params, limit }: JobSourceQuery): Promise<Lead[]> {
    const location = [params.city, params.state].filter(Boolean).join(", ");
    const u = new URL("https://www.ziprecruiter.com/jobs-search");
    u.searchParams.set("search", query);
    if (location && !params.remote) {
      u.searchParams.set("location", location);
    } else if (params.remote) {
      u.searchParams.set("location", "remote");
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
        console.warn(`[ziprecruiterScraper] ${res.status}`);
        return [];
      }
      
      const html = await res.text();
      const leads: Lead[] = [];

      const regex = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*job_link[^"]*"[^>]*>(.*?)<\/a>/gis;
      let match;
      while ((match = regex.exec(html)) !== null && leads.length < limit) {
        const url = match[1];
        let title = match[2].replace(/<[^>]+>/g, "").trim();
        title = decodeEntities(title);
        
        if (title && url) {
          leads.push({
            id: `zr-fb-${leads.length}-${title.slice(0, 20)}`,
            title,
            source: "ZipRecruiter",
            location: location,
            url,
            snippet: "Job listing from ZipRecruiter — open the listing for full details.",
          });
        }
      }

      return leads;
    } catch (err) {
      console.warn("[ziprecruiterScraper] failed", err);
      return [];
    }
  },
};
