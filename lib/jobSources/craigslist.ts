import { Lead } from "@/types";
import { JobSource, JobSourceQuery } from "./types";

/**
 * Craigslist fallback scraper — jobs (jjj) and gigs (ggg) sections, the
 * latter being where construction / labor / day-work gigs live.
 *
 * Craigslist serves static, no-JS markup (`cl-static-search-result` items),
 * so a plain fetch + parse works — no headless browser needed (Playwright/
 * Chromium can't run inside Vercel serverless limits anyway). Used only as a
 * low-volume fallback when the paid job API is unavailable or out of credits.
 * Heads up: scraping is against Craigslist's ToS — this is best-effort and
 * may break or be blocked at any time.
 */

// City names whose Craigslist subdomain isn't just the name with spaces removed.
const SITE_OVERRIDES: Record<string, string> = {
  "new york": "newyork",
  "brooklyn": "newyork",
  "san francisco": "sfbay",
  "oakland": "sfbay",
  "san jose": "sfbay",
  "los angeles": "losangeles",
  "washington": "washingtondc",
  "dallas": "dallas",
  "fort worth": "dallas",
  "minneapolis": "minneapolis",
  "st. paul": "minneapolis",
  "saint paul": "minneapolis",
  "st. louis": "stlouis",
  "saint louis": "stlouis",
  "kansas city": "kansascity",
  "las vegas": "lasvegas",
  "salt lake city": "saltlakecity",
  "west valley city": "saltlakecity",
  "long beach": "losangeles",
  "virginia beach": "norfolk",
  "colorado springs": "cosprings",
  "new orleans": "neworleans",
  "santa ana": "orangecounty",
  "anaheim": "orangecounty",
  "irvine": "orangecounty",
  "fort lauderdale": "miami",
  "st. petersburg": "tampa",
  "saint petersburg": "tampa",
  "newark": "newjersey",
  "jersey city": "newjersey",
  "arlington": "dallas",
  "mesa": "phoenix",
  "scottsdale": "phoenix",
  "tempe": "phoenix",
  "aurora": "denver",
  "tacoma": "seattle",
  "bellevue": "seattle",
  "santa fe": "santafe",
  "el paso": "elpaso",
  "san antonio": "sanantonio",
  "san diego": "sandiego",
  "oklahoma city": "oklahomacity",
  "grand rapids": "grandrapids",
  "baton rouge": "batonrouge",
  "little rock": "littlerock",
  "des moines": "desmoines",
  "sioux falls": "siouxfalls",
  "green bay": "greenbay",
  "ann arbor": "annarbor",
  "fort collins": "fortcollins",
  "corpus christi": "corpuschristi",
};

function citySite(city: string): string | null {
  const key = city.trim().toLowerCase();
  if (!key) return null;
  if (SITE_OVERRIDES[key]) return SITE_OVERRIDES[key];
  // Heuristic: most CL sites are the city name with spaces/punctuation removed.
  const slug = key.replace(/[^a-z]/g, "");
  return slug || null;
}

// Sections to search: jjj = all jobs, ggg = all gigs (construction/labor day work).
const SECTIONS = ["jjj", "ggg"] as const;

export const craigslist: JobSource = {
  name: "Craigslist",

  isConfigured() {
    return true; // no key needed — availability gated by the fallback tier
  },

  async search({ query, params, limit }: JobSourceQuery): Promise<Lead[]> {
    if (params.remote) return []; // CL is location-based; RemoteOK covers remote
    const site = citySite(params.city);
    if (!site) return [];

    const perSection = Math.max(3, Math.ceil(limit / SECTIONS.length));
    const batches = await Promise.all(
      SECTIONS.map(async (section) => {
        try {
          return await searchSection(site, section, query, perSection);
        } catch (err: any) {
          // Unknown subdomain (DNS failure) or blocked request — just skip.
          console.warn(`[craigslist] ${site}/${section} failed:`, err?.message);
          return [] as Lead[];
        }
      })
    );

    // De-dupe by listing URL across sections.
    const seen = new Set<string>();
    const out: Lead[] = [];
    for (const lead of batches.flat()) {
      if (lead.url && seen.has(lead.url)) continue;
      if (lead.url) seen.add(lead.url);
      out.push(lead);
    }
    return out.slice(0, limit);
  },
};

async function searchSection(
  site: string,
  section: string,
  query: string,
  limit: number
): Promise<Lead[]> {
  const url = `https://${site}.craigslist.org/search/${section}?query=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url, {
    headers: {
      // A browser-ish UA — CL returns the static markup either way.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) {
    console.warn(`[craigslist] ${url} -> ${res.status}`);
    return [];
  }
  const html = await res.text();
  return parseStaticResults(html, section).slice(0, limit);
}

/** Parse Craigslist's no-JS `cl-static-search-result` list items. */
export function parseStaticResults(html: string, section: string): Lead[] {
  const items =
    html.match(/<li class="cl-static-search-result"[\s\S]*?<\/li>/g) ?? [];
  const leads: Lead[] = [];

  for (const item of items) {
    const title = decodeEntities(
      item.match(/title="([^"]*)"/)?.[1] ??
        item.match(/<div class="title">([^<]*)<\/div>/)?.[1] ??
        ""
    ).trim();
    const url = item.match(/href="([^"]+)"/)?.[1];
    if (!title || !url) continue;

    // CL emits "$0" when the poster didn't set a price — treat as no pay info.
    const rawPrice = decodeEntities(
      item.match(/<div class="price">([^<]*)<\/div>/)?.[1] ?? ""
    ).trim();
    const price = /^\$?0$/.test(rawPrice) ? "" : rawPrice;
    const location = decodeEntities(
      item.match(/<div class="location">([^<]*)<\/div>/)?.[1] ?? ""
    ).trim();

    leads.push({
      id: `cl-${section}-${leads.length}-${title.slice(0, 20)}`,
      title,
      source: "Craigslist",
      location: location || undefined,
      url,
      pay: price || undefined,
      snippet:
        section === "ggg"
          ? "Gig listing from Craigslist — open the listing for full details."
          : "Job listing from Craigslist — open the listing for full details.",
    });
  }
  return leads;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}
