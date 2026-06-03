// Server-only OpenAI helper. Used inside app/*+api.ts route handlers so the
// key never reaches the client bundle.

const ENDPOINT = "https://api.openai.com/v1/chat/completions";
export const OPENAI_MODEL = "gpt-4o-mini";

export function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env to enable AI features."
    );
  }
  return key;
}

async function call(
  system: string,
  user: string,
  opts: { maxTokens?: number; json?: boolean; temperature?: number } = {}
): Promise<string> {
  const key = getOpenAIKey();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: opts.maxTokens ?? 800,
      temperature: opts.temperature ?? 0.5,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
  }
  const data: any = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Chat completion that must return a JSON object. */
export async function openaiJSON<T>(
  system: string,
  user: string,
  maxTokens = 1500
): Promise<T> {
  const text = await call(system, user, { json: true, maxTokens });
  return JSON.parse(text) as T;
}

/** Chat completion returning plain text. */
export async function openaiText(
  system: string,
  user: string,
  maxTokens = 700
): Promise<string> {
  return (await call(system, user, { maxTokens })).trim();
}
