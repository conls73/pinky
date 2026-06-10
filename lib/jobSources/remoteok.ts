import { Lead } from "@/types";
import { JobSource, JobSourceQuery } from "./types";

/**
 * RemoteOK fallback — free public JSON API (https://remoteok.com/api), no key
 * required. Their terms ask that listings link back to the original post,
 * which the lead `url` does. Remote-only, so it runs just for remote searches.
 */
export const remoteok: JobSource = {
  name: "RemoteOK",

  isConfigured() {
    return true; // no key needed — availability gated by the fallback tier
  },

  async search({ query, params, limit }: JobSourceQuery): Promise<Lead[]> {
    if (!params.remote) return [];

    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "PinkyJobScout/1.0" },
    });
    if (!res.ok) {
      console.warn(`[remoteok] API error ${res.status}`);
      return [];
    }
    const data: any[] = await res.json();
    // First element is a legal notice, not a job.
    const jobs = data.filter((j) => j && j.id && j.position);

    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2 && t !== "remote");

    const scored = jobs
      .map((j) => {
        const hay = `${j.position} ${(j.tags ?? []).join(" ")} ${
          j.description ?? ""
        }`.toLowerCase();
        const hits = terms.filter((t) => hay.includes(t)).length;
        return { j, hits };
      })
      // With search terms, require at least one match; otherwise take newest.
      .filter(({ hits }) => terms.length === 0 || hits > 0)
      .sort((a, b) => b.hits - a.hits);

    return scored.slice(0, limit).map(({ j }) => toLead(j));
  },
};

function toLead(j: any): Lead {
  const pay =
    j.salary_min && j.salary_max
      ? `$${Math.round(j.salary_min / 1000)}k–$${Math.round(
          j.salary_max / 1000
        )}k`
      : undefined;
  return {
    id: `remoteok-${j.id}`,
    title: j.position,
    company: j.company || undefined,
    source: "RemoteOK",
    location: "Remote",
    url: j.url,
    pay,
    snippet: stripHtml(j.description ?? "").slice(0, 1500),
    postedDate: j.date ? new Date(j.date).toLocaleDateString() : undefined,
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
