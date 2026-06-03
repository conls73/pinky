import { Lead } from "@/types";
import { JobSource, JobSourceQuery } from "./types";

// Cap on how many pages to pull (each page ~10 jobs = one billed request).
const MAX_PAGES = 3;

/**
 * Google Jobs via SearchApi.io (https://www.searchapi.io/docs/google-jobs).
 * Live job source for the MVP. Requires SEARCHAPI_KEY. Paginates with
 * next_page_token to return more than the default 10 results.
 */
export const googleJobs: JobSource = {
  name: "Google Jobs",

  isConfigured() {
    return !!process.env.SEARCHAPI_KEY;
  },

  async search({ query, params, limit }: JobSourceQuery): Promise<Lead[]> {
    const key = process.env.SEARCHAPI_KEY;
    if (!key) return [];

    const location = [params.city, params.state].filter(Boolean).join(", ");
    const out: Lead[] = [];
    let token: string | undefined;
    let pages = 0;

    do {
      const url = new URL("https://www.searchapi.io/api/v1/search");
      url.searchParams.set("engine", "google_jobs");
      url.searchParams.set("q", query);
      // For remote searches we skip the geographic location filter.
      if (location && !params.remote) url.searchParams.set("location", location);
      url.searchParams.set("gl", "us");
      url.searchParams.set("hl", "en");
      url.searchParams.set("api_key", key);
      if (token) url.searchParams.set("next_page_token", token);

      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn(`[googleJobs] SearchApi error ${res.status}`);
        break;
      }
      const data: any = await res.json();
      const jobs: any[] = data.jobs ?? [];
      for (const j of jobs) out.push(toLead(j, out.length));

      token = data.pagination?.next_page_token;
      pages++;
    } while (token && out.length < limit && pages < MAX_PAGES);

    return out.slice(0, limit);
  },
};

function toLead(j: any, index: number): Lead {
  const ext = j.detected_extensions ?? {};
  const link =
    j.apply_link || j.apply_links?.[0]?.link || j.sharing_link || undefined;
  return {
    id: `google-${index}-${(j.title ?? "").slice(0, 20)}`,
    title: j.title ?? "Untitled role",
    company: j.company_name,
    source: "Google Jobs",
    location: j.location,
    url: link,
    pay: ext.salary,
    snippet: stripHtml(j.description ?? ""),
    postedDate: ext.posted_at,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
