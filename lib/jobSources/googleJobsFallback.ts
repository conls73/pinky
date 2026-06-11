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

export const googleJobsFallback: JobSource = {
  name: "Google Jobs (Scraper)",
  isConfigured() {
    return true; // Used when the primary Google Jobs API fails
  },
  async search({ query, params, limit }: JobSourceQuery): Promise<Lead[]> {
    const location = [params.city, params.state].filter(Boolean).join(", ");
    const searchTerms = params.remote ? `${query} remote jobs` : `${query} jobs near ${location}`;
    const u = new URL("https://www.google.com/search");
    u.searchParams.set("q", searchTerms);
    u.searchParams.set("ibp", "htl;jobs"); // Google Jobs special param

    try {
      const res = await fetch(u.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (!res.ok) {
        console.warn(`[googleJobsScraper] ${res.status}`);
        return [];
      }
      
      const html = await res.text();
      const leads: Lead[] = [];

      // Google HTML has job titles inside div class BjJfJf or similar headers
      const regex = /<div[^>]*class="[^"]*BjJfJf[^"]*"[^>]*>(.*?)<\/div>/gis;
      let match;
      while ((match = regex.exec(html)) !== null && leads.length < limit) {
        let title = match[1].replace(/<[^>]+>/g, "").trim();
        title = decodeEntities(title);
        
        if (title) {
          leads.push({
            id: `gj-fb-${leads.length}-${title.slice(0, 20)}`,
            title,
            source: "Google Jobs",
            location: location,
            snippet: "Job listing found via Google Jobs scraper.",
          });
        }
      }

      return leads;
    } catch (err) {
      console.warn("[googleJobsScraper] failed", err);
      return [];
    }
  },
};
