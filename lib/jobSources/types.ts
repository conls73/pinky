import { Lead, SearchParams } from "@/types";

export interface JobSourceQuery {
  /** Search keywords, e.g. "warehouse associate" or "house cleaner". */
  query: string;
  params: SearchParams;
  /** Soft cap on how many leads this source should return. */
  limit: number;
}

export interface JobSource {
  name: Lead["source"];
  /** Whether the source has the config (API key, etc.) it needs to run. */
  isConfigured(): boolean;
  search(q: JobSourceQuery): Promise<Lead[]>;
}
