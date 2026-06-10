// Shared data model for the Pinky MVP flow.

export type ExperienceLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "unknown";

export interface WorkHistoryItem {
  title: string;
  employer?: string;
  dates?: string;
}

export interface ResumeProfile {
  name?: string;
  workHistory: WorkHistoryItem[];
  skills: string[];
  industries: string[];
  tools: string[];
  jobTitles: string[];
  location?: string;
  experienceLevel: ExperienceLevel;
  possibleMatches: string[];
}

export interface SearchParams {
  city: string;
  state: string;
  zip: string;
  radiusMiles: number;
  remote: boolean;
  /** Direct search keywords, e.g. "construction laborer". Takes priority over resume/preferences. */
  query?: string;
  preferencesText?: string;
}

export type JobSourceName =
  | "Google Jobs"
  | "Craigslist"
  | "RemoteOK"
  | "Thumbtack"
  | "Indeed"
  | "LinkedIn"
  | "ZipRecruiter";

export interface Lead {
  id: string;
  title: string;
  company?: string;
  source: JobSourceName;
  location?: string;
  url?: string;
  pay?: string;
  snippet?: string;
  postedDate?: string;
}

export interface RankedLead extends Lead {
  score: number; // 0-100 fit score
  whyItFits: string;
}

export interface CoverLetter {
  coverLetter: string;
}

// An empty profile used as a safe default before parsing.
export const emptyProfile: ResumeProfile = {
  workHistory: [],
  skills: [],
  industries: [],
  tools: [],
  jobTitles: [],
  experienceLevel: "unknown",
  possibleMatches: [],
};
