import { openaiJSON } from "@/lib/openai";
import { CoverLetter, Lead, ResumeProfile } from "@/types";

export async function POST(req: Request): Promise<Response> {
  try {
    const { profile, lead } = (await req.json()) as {
      profile: ResumeProfile;
      lead: Lead;
    };

    let result: CoverLetter;
    try {
      result = await writeWithOpenAI(profile, lead);
    } catch (err: any) {
      if (!err?.message?.includes("OPENAI_API_KEY")) {
        console.warn("[cover-letter] fell back to template:", err?.message);
      }
      result = { coverLetter: templateCoverLetter(profile, lead) };
    }

    return Response.json(result);
  } catch (err: any) {
    console.error("[cover-letter]", err);
    return Response.json(
      { error: err?.message ?? "Failed to write cover letter." },
      { status: 500 }
    );
  }
}

async function writeWithOpenAI(
  profile: ResumeProfile,
  lead: Lead
): Promise<CoverLetter> {
  const system = `You are Pinky, helping someone apply for a job fast. Write a short, confident,
friendly COVER LETTER they can send as-is (about 150-200 words). Use their real strengths from the
profile; do NOT invent specific employers or fake experience. Plain, human language — no corporate
buzzwords. Start with "Dear Hiring Manager," and end with a sign-off using their name if available.
Return ONLY JSON: { "coverLetter": string }.`;

  const user = `PROFILE:\n${JSON.stringify(profile)}\n\nJOB:\n${JSON.stringify({
    title: lead.title,
    company: lead.company,
    location: lead.location,
    description: (lead.snippet ?? "").slice(0, 1500),
  })}\n\nWrite the cover letter now. JSON only.`;

  return openaiJSON<CoverLetter>(system, user, 700);
}

function templateCoverLetter(profile: ResumeProfile, lead: Lead): string {
  const name = profile.name || "";
  const strength =
    profile.skills.slice(0, 3).join(", ") ||
    "a strong work ethic, reliability, and a fast-learning attitude";
  const company = lead.company ? ` at ${lead.company}` : "";
  return `Dear Hiring Manager,

I'm excited to apply for the ${lead.title} role${company}. I bring ${strength}, and I'm ready to start right away and contribute from day one.

I take pride in showing up dependable, learning quickly, and doing good work that helps the team. I'd welcome the chance to talk about how I can help${company ? ` at ${lead.company}` : ""}.

Thank you for your time and consideration.

Sincerely,
${name || "—"}`;
}
