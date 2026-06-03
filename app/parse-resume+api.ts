import { unzipSync } from "fflate";
import { getClient, extractJson, MODEL, responseText } from "@/lib/anthropic";
import { emptyProfile, ResumeProfile } from "@/types";

const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Extract plain text from a .docx (a zip whose word/document.xml holds the body).
function extractDocxText(base64: string): string {
  const bytes = new Uint8Array(Buffer.from(base64, "base64"));
  const files = unzipSync(bytes);
  const xml = files["word/document.xml"];
  if (!xml) return "";
  const raw = new TextDecoder().decode(xml);
  return raw
    .replace(/<\/w:p>/g, "\n") // paragraphs -> newlines
    .replace(/<w:tab\/?>/g, "\t")
    .replace(/<[^>]+>/g, "") // strip remaining tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SYSTEM = `You are Pinky's resume parser. Extract a structured work profile from a resume.
Return ONLY a JSON object with exactly these keys:
{
  "name": string | null,
  "workHistory": [{ "title": string, "employer": string | null, "dates": string | null }],
  "skills": string[],
  "industries": string[],
  "tools": string[],
  "jobTitles": string[],
  "location": string | null,
  "experienceLevel": "entry" | "junior" | "mid" | "senior" | "unknown",
  "possibleMatches": string[]
}
"possibleMatches" = 4-8 concrete local job/gig titles this person could realistically get,
including hands-on, temp, gig, and entry-level options when relevant (e.g. "Warehouse Associate",
"Delivery Driver", "House Cleaner"). Be generous and practical — many users need work fast and
do not have a clean career path. Output JSON only, no prose.`;

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { base64, mimeType, text } = body as {
      base64?: string;
      mimeType?: string;
      text?: string;
    };

    const client = getClient();

    const userContent: any[] = [];
    if (base64 && mimeType === "application/pdf") {
      userContent.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      });
    } else if (base64 && mimeType === DOCX_TYPE) {
      // Word .docx — extract text, then hand it to Claude as text.
      const docText = extractDocxText(base64);
      userContent.push({ type: "text", text: `RESUME TEXT:\n${docText}` });
    } else if (text) {
      userContent.push({ type: "text", text: `RESUME TEXT:\n${text}` });
    } else if (base64) {
      // Plain text, legacy .doc, or unknown — best-effort decode to text.
      const decoded = Buffer.from(base64, "base64")
        .toString("utf8")
        .replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, " ");
      userContent.push({ type: "text", text: `RESUME TEXT:\n${decoded}` });
    } else {
      return Response.json({ error: "No resume provided." }, { status: 400 });
    }
    userContent.push({
      type: "text",
      text: "Extract the profile as specified. JSON only.",
    });

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const parsed = extractJson<Partial<ResumeProfile>>(responseText(msg));
    const profile: ResumeProfile = {
      ...emptyProfile,
      ...parsed,
      name: parsed.name ?? undefined,
      location: parsed.location ?? undefined,
      workHistory: parsed.workHistory ?? [],
      skills: parsed.skills ?? [],
      industries: parsed.industries ?? [],
      tools: parsed.tools ?? [],
      jobTitles: parsed.jobTitles ?? [],
      possibleMatches: parsed.possibleMatches ?? [],
      experienceLevel: parsed.experienceLevel ?? "unknown",
    };

    return Response.json({ profile });
  } catch (err: any) {
    console.error("[parse-resume]", err);
    const message = err?.message ?? "Failed to parse resume.";
    const noKey = message.includes("ANTHROPIC_API_KEY");
    return Response.json(
      { error: message, noKey },
      { status: noKey ? 503 : 500 }
    );
  }
}
