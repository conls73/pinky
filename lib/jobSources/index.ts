import { Lead } from "@/types";
import { googleJobs } from "./googleJobs";
import { indeed, linkedin, thumbtack, ziprecruiter } from "./stubs";
import { JobSource, JobSourceQuery } from "./types";

// All registered sources. Google Jobs is the working reference; the rest are
// stubs until their official APIs are wired up (see stubs.ts).
export const ALL_SOURCES: JobSource[] = [
  googleJobs,
  thumbtack,
  indeed,
  linkedin,
  ziprecruiter,
];

export function configuredSources(): JobSource[] {
  return ALL_SOURCES.filter((s) => s.isConfigured());
}

/** Run every configured source in parallel, then merge + de-dupe the leads. */
export async function aggregate(q: JobSourceQuery): Promise<Lead[]> {
  const sources = configuredSources();
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

  const merged = batches.flat();
  return dedupe(merged);
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
