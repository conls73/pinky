import { aggregate, configuredSources } from "@/lib/jobSources";
import { openaiJSON } from "@/lib/openai";
import { sampleLeads } from "@/lib/sampleLeads";
import {
  ALL_OPPORTUNITY_TYPES,
  Lead,
  OpportunityType,
  RankedLead,
  ResumeProfile,
  SearchParams,
} from "@/types";

// Soft cap on how many live jobs to gather + rank (~100 = up to 10 SearchApi
// pages/credits per search).
const MAX_RESULTS = 100;

// To stay within the serverless time budget, only the most promising leads get
// the (slower) AI "why it fits" pass; the rest keep their heuristic ranking.
const AI_RANK_CAP = 50;

/** Selected opportunity types, normalized — empty/all both mean "broad mix". */
function selectedTypes(params: SearchParams): OpportunityType[] {
  const t = params.opportunityTypes ?? [];
  if (t.length === 0 || t.length === ALL_OPPORTUNITY_TYPES.length) return [];
  return t;
}

function buildQuery(profile: ResumeProfile, params: SearchParams): string {
  let base: string;
  // Explicit search keywords win; resume/preferences fill in when absent.
  if (params.query?.trim()) base = params.query.trim();
  else if (params.preferencesText?.trim()) base = params.preferencesText.trim();
  else if (profile.jobTitles.length) base = profile.jobTitles[0];
  else if (profile.possibleMatches.length) base = profile.possibleMatches[0];
  else base = "general labor";

  // When the user narrows to a subset of opportunity types, bias the keywords.
  // "job" carries no keyword (it's ordinary employment); gig/contractor do.
  const typeWords = selectedTypes(params)
    .filter((t) => t !== "job")
    .map((t) => (t === "gig" ? "gig" : "contractor"));
  if (typeWords.length) base = `${base} ${typeWords.join(" ")}`;

  return params.remote ? `${base} remote` : base;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { profile, params } = (await req.json()) as {
      profile: ResumeProfile;
      params: SearchParams;
    };

    const query = buildQuery(profile, params);
    const { leads: live, usedFallback } = await aggregate({
      query,
      params,
      limit: MAX_RESULTS,
    });

    const usedSampleData = live.length === 0;
    const leads = usedSampleData ? sampleLeads(profile, params) : live;

    let ranked: RankedLead[];
    try {
      ranked = await rankLeads(profile, params, leads);
    } catch (err: any) {
      if (!err?.message?.includes("OPENAI_API_KEY")) {
        console.warn("[search] ranking fell back to heuristic:", err?.message);
      }
      ranked = rankHeuristic(profile, leads);
    }

    return Response.json({
      leads: ranked,
      usedSampleData,
      usedFallback,
      activeSources: configuredSources().map((s) => s.name),
    });
  } catch (err: any) {
    console.error("[search]", err);
    return Response.json(
      { error: err?.message ?? "Search failed." },
      { status: 500 }
    );
  }
}

/**
 * For small result sets, AI-rank everything. For large sets, AI-rank only the
 * heuristic top slice (keeps the OpenAI call within the serverless time/cost
 * budget) and keep the heuristic ranking for the tail.
 */
async function rankLeads(
  profile: ResumeProfile,
  params: SearchParams,
  leads: Lead[]
): Promise<RankedLead[]> {
  if (leads.length <= AI_RANK_CAP) {
    return rankWithOpenAI(profile, params, leads);
  }
  const pre = rankHeuristic(profile, leads); // sorted best-first
  const aiTop = await rankWithOpenAI(
    profile,
    params,
    pre.slice(0, AI_RANK_CAP)
  );
  return [...aiTop, ...pre.slice(AI_RANK_CAP)];
}

async function rankWithOpenAI(
  profile: ResumeProfile,
  params: SearchParams,
  leads: Lead[]
): Promise<RankedLead[]> {
  const system = `You are Pinky, a friendly work-finding scout. Given a person's profile and a list
of local job/gig leads, rank the leads by how well they fit and how realistically the person can
get them FAST. For each lead return a fit "score" (0-100) and a short, warm "whyItFits" (1-2
sentences, plain language, no jargon) that references the actual role. Favor leads matching their
experience, location, and stated preferences, but also surface practical options for someone who
needs work quickly. Return ONLY JSON: { "ranked": [{ "id": string, "score": number, "whyItFits":
string }] } sorted by score descending, including every lead id exactly once.`;

  const leadsBlock = JSON.stringify(
    leads.map((l) => ({
      id: l.id,
      title: l.title,
      company: l.company,
      location: l.location,
      pay: l.pay,
      snippet: (l.snippet ?? "").slice(0, 280),
    }))
  );

  const user = `PROFILE:\n${JSON.stringify(profile)}\n\nPREFERENCES: ${
    params.preferencesText || "(none given)"
  }\nAREA: ${params.remote ? "Remote" : `${params.city}, ${params.state}`}\n\nLEADS:\n${leadsBlock}\n\nRank them now. JSON only.`;

  const out = await openaiJSON<{
    ranked: Array<{ id: string; score: number; whyItFits: string }>;
  }>(system, user, 6000);

  const byId = new Map((out.ranked ?? []).map((s) => [s.id, s]));
  return leads
    .map((lead): RankedLead => {
      const s = byId.get(lead.id);
      return {
        ...lead,
        score: clamp(s?.score ?? 50),
        whyItFits:
          s?.whyItFits ?? "A practical local option worth a quick look.",
      };
    })
    .sort((a, b) => b.score - a.score);
}

/** Keyword-overlap fallback so the flow works with no API key configured. */
function rankHeuristic(profile: ResumeProfile, leads: Lead[]): RankedLead[] {
  const terms = [
    ...profile.skills,
    ...profile.jobTitles,
    ...profile.industries,
    ...profile.tools,
  ]
    .map((t) => t.toLowerCase())
    .filter(Boolean);

  return leads
    .map((lead): RankedLead => {
      const hay = `${lead.title} ${lead.snippet ?? ""}`.toLowerCase();
      const hits = terms.filter((t) => hay.includes(t));
      const score = clamp(55 + hits.length * 9);
      const why = hits.length
        ? `Matches your background in ${unique(hits).slice(0, 3).join(", ")}.`
        : `A practical local option that's quick to apply for near you.`;
      return { ...lead, score, whyItFits: why };
    })
    .sort((a, b) => b.score - a.score);
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function unique(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
