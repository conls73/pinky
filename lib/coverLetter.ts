import { Lead, ResumeProfile } from "@/types";

/**
 * Builds a solid cover-letter draft entirely on-device — no API call, no cost.
 * It pulls real details from the parsed resume when available and degrades
 * gracefully when the resume is empty (resume is optional). The result is meant
 * to be edited by the user before sending.
 */
export function draftCoverLetter(profile: ResumeProfile, lead: Lead): string {
  const role = lead.title?.trim() || "this role";
  const company = lead.company?.trim();
  const at = company ? ` at ${company}` : "";
  const where = lead.location?.trim() ? ` in ${lead.location.trim()}` : "";

  const strengths = unique(
    [...(profile.skills ?? []), ...(profile.tools ?? [])].map((s) => s.trim())
  )
    .filter(Boolean)
    .slice(0, 3);

  const strengthLine = strengths.length
    ? `I bring hands-on experience with ${listJoin(strengths)}, and I pride myself on showing up on time and getting the job done right.`
    : `I'm hardworking, dependable, and a fast learner who shows up on time and gets the job done right.`;

  const priorTitle = profile.jobTitles?.[0]?.trim();
  const experienceLine = priorTitle
    ? `My background as a ${priorTitle} has prepared me well for the work this position involves.`
    : `I'm eager to learn, ready to start quickly, and committed to doing great work for your team.`;

  const signoff = profile.name?.trim() || "[Your name]";

  return [
    "Dear Hiring Manager,",
    "",
    `I'm excited to apply for the ${role} position${at}${where}. ${strengthLine}`,
    "",
    `${experienceLine} I can start soon and would be grateful for the chance to contribute.`,
    "",
    "Thank you for your time and consideration. I'd welcome the opportunity to talk about how I can help.",
    "",
    "Sincerely,",
    signoff,
  ].join("\n");
}

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
