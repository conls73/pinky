import { Lead } from "@/types";
import { craigslist } from "./craigslist";
import { googleJobs } from "./googleJobs";
import { remoteok } from "./remoteok";
import { indeed, linkedin, nextdoor, thumbtack, ziprecruiter } from "./stubs";
import { JobSource, JobSourceQuery } from "./types";

// Primary tier: official APIs. Google Jobs is the working reference; the rest
// are stubs until their official APIs are wired up (see stubs.ts).
export const PRIMARY_SOURCES: JobSource[] = [
  googleJobs,
  thumbtack,
  indeed,
  linkedin,
  ziprecruiter,
  nextdoor,
];

// Fallback tier: keyless scrapers/public feeds. Only run when the primary
// tier returns nothing (no key configured, quota exhausted, or API error) so
// paid credits stay the default and scraping stays low-volume.
export const FALLBACK_SOURCES: JobSource[] = [craigslist, remoteok];

export function configuredSources(): JobSource[] {
  return PRIMARY_SOURCES.filter((s) => s.isConfigured());
}

export interface AggregateResult {
  leads: Lead[];
  /** True when results came from the scraper tier instead of the paid API. */
  usedFallback: boolean;
}

/**
 * Run the primary (API) sources in parallel; if they produce nothing, fall
 * back to the scraper tier. Results are merged + de-duped.
 */
export async function aggregate(q: JobSourceQuery): Promise<AggregateResult> {
  const primary = await runSources(configuredSources(), q);
  if (primary.length > 0) {
    return { leads: dedupe(primary), usedFallback: false };
  }

  const fallback = await runSources(
    FALLBACK_SOURCES.filter((s) => s.isConfigured()),
    q
  );
  return { leads: dedupe(fallback), usedFallback: fallback.length > 0 };
}

async function runSources(
  sources: JobSource[],
  q: JobSourceQuery
): Promise<Lead[]> {
  const batches = await Promise.all(
    sources.map(async (s) => {
      try {
        return await s.search(q);
      } catch (err) {
        console.warn(`[jobSources] ${s.name} failed:`, err);
        return [] as Lead[];
      }
    })
  );
  return batches.flat();
}

function dedupe(leads: Lead[]): Lead[] {
  const seen = new Set<string>();
  const out: Lead[] = [];
  for (const lead of leads) {
    const key = `${lead.title}|${lead.company ?? ""}|${lead.location ?? ""}`
      .toLowerCase()
      .trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(lead);
  }
  return out;
}
