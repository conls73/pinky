import { JobSourceName } from "@/types";

// A Google Jobs listing is just an aggregator entry — its apply link usually
// points somewhere real: Indeed, ZipRecruiter, LinkedIn, Craigslist, or the
// employer's own site. We badge the listing by where it ACTUALLY goes (parsed
// from the URL) so people know the destination before they tap.
//
// Favicons come from Google's free, keyless s2 service — no API key, no cost.

const KNOWN_BOARDS: Array<[domain: string, label: string]> = [
  ["indeed.com", "Indeed"],
  ["ziprecruiter.com", "ZipRecruiter"],
  ["linkedin.com", "LinkedIn"],
  ["craigslist.org", "Craigslist"],
  ["glassdoor.com", "Glassdoor"],
  ["monster.com", "Monster"],
  ["simplyhired.com", "SimplyHired"],
  ["snagajob.com", "Snagajob"],
  ["remoteok.com", "RemoteOK"],
  ["remoteok.io", "RemoteOK"],
  ["nextdoor.com", "Nextdoor"],
  ["thumbtack.com", "Thumbtack"],
  ["careerbuilder.com", "CareerBuilder"],
  ["dice.com", "Dice"],
  ["talent.com", "Talent.com"],
  ["lensa.com", "Lensa"],
  ["adzuna.com", "Adzuna"],
  ["jooble.org", "Jooble"],
  ["jobcase.com", "Jobcase"],
  ["wellfound.com", "Wellfound"],
  ["greenhouse.io", "Greenhouse"],
  ["lever.co", "Lever"],
  ["myworkdayjobs.com", "Workday"],
];

// Source name -> domain, for leads with no URL (e.g. sample data).
const SOURCE_DOMAINS: Partial<Record<JobSourceName, string>> = {
  Craigslist: "craigslist.org",
  RemoteOK: "remoteok.com",
  Indeed: "indeed.com",
  LinkedIn: "linkedin.com",
  ZipRecruiter: "ziprecruiter.com",
  Thumbtack: "thumbtack.com",
  Nextdoor: "nextdoor.com",
};

export interface DestinationInfo {
  label: string;
  domain: string;
}

function hostnameOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function boardFromHost(host: string | null): DestinationInfo | null {
  if (!host) return null;
  for (const [domain, label] of KNOWN_BOARDS) {
    if (host === domain || host.endsWith("." + domain)) {
      return { label, domain };
    }
  }
  return null;
}

/**
 * Where this listing actually sends the user. Prefers the real URL's domain;
 * falls back to the source's own site. Returns null for Google Jobs links that
 * resolve to an unknown employer site (we leave those as just the company name)
 * and for Google's own redirect URLs.
 */
export function destinationFor(
  source: JobSourceName,
  url?: string
): DestinationInfo | null {
  const host = hostnameOf(url);

  // Recognized job board / ATS in the apply link — badge it.
  const board = boardFromHost(host);
  if (board) return board;

  // Non-Google sources keep their own badge even without a URL match.
  if (source !== "Google Jobs") {
    const domain = SOURCE_DOMAINS[source];
    if (domain) return { label: source, domain };
  }

  return null;
}

export function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
