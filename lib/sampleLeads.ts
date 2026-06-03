import { JobSourceName, Lead, ResumeProfile, SearchParams } from "@/types";

/**
 * Demo fallback. When no live job source is configured (e.g. no SEARCHAPI_KEY),
 * we still want the full flow to show realistic leads. These are clearly marked
 * as sample data in the UI and are generated from the user's profile + area so
 * they feel relevant.
 */
export function sampleLeads(
  profile: ResumeProfile,
  params: SearchParams
): Lead[] {
  const loc = params.remote
    ? "Remote"
    : [params.city, params.state].filter(Boolean).join(", ") || "Your area";
  const role =
    profile.jobTitles[0] ||
    profile.possibleMatches[0] ||
    (params.preferencesText ? params.preferencesText : "General Worker");
  const skill = profile.skills[0] || "reliability";

  const templates: Array<{
    title: string;
    company: string;
    source: JobSourceName;
    pay?: string;
    snippet: string;
  }> = [
    {
      title: `${role}`,
      company: "Cascade Staffing",
      source: "Google Jobs",
      pay: "$19–$24/hr",
      snippet: `Immediate opening for a ${role}. Looking for someone with ${skill}. Full-time, benefits after 60 days.`,
    },
    {
      title: `Part-time ${role} (Weekends)`,
      company: "Local Hire Co.",
      source: "Indeed",
      pay: "$18/hr",
      snippet: `Flexible weekend shifts. Great for picking up extra hours. ${skill} a plus.`,
    },
    {
      title: `Handyman / Helper`,
      company: "Neighborly Services",
      source: "Thumbtack",
      pay: "$25/hr • cash friendly",
      snippet: `Homeowners near ${loc} need help with small jobs this week. Set your own schedule.`,
    },
    {
      title: `Warehouse Associate`,
      company: "RapidShip Logistics",
      source: "ZipRecruiter",
      pay: "$20/hr",
      snippet: `Day and night shifts available. No experience required — we train. Weekly pay.`,
    },
    {
      title: `${role} — Temp to Hire`,
      company: "BridgeWork Talent",
      source: "LinkedIn",
      pay: "$22/hr",
      snippet: `Temp-to-hire role for a motivated ${role}. Strong path to permanent placement.`,
    },
  ];

  return templates.map((t, i) => ({
    id: `sample-${i}`,
    title: t.title,
    company: t.company,
    source: t.source,
    location: loc,
    url: undefined,
    pay: t.pay,
    snippet: t.snippet,
    postedDate: `${i + 1}d ago`,
  }));
}
