import { Lead } from "@/types";
import { JobSource } from "./types";

/**
 * Placeholder sources for Thumbtack, Indeed, LinkedIn, ZipRecruiter, and
 * Nextdoor.
 *
 * These platforms have no open, scraping-friendly public API and have strict
 * terms of service. A production build needs their official/partner APIs (or a
 * licensed aggregator). Until that access is wired up, each adapter reports
 * "not configured" and contributes no leads — the aggregator skips them
 * cleanly so the rest of the flow keeps working. Real implementations drop in
 * behind this exact `JobSource` interface with no UI changes.
 */
function makeStub(name: Lead["source"]): JobSource {
  return {
    name,
    isConfigured() {
      return false;
    },
    async search() {
      return [];
    },
  };
}

export const thumbtack = makeStub("Thumbtack");
export const indeed = makeStub("Indeed");
export const linkedin = makeStub("LinkedIn");
export const ziprecruiter = makeStub("ZipRecruiter");
export const nextdoor = makeStub("Nextdoor");
