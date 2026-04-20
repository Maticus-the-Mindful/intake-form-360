import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = { businessDescription?: string };

const SYSTEM_PROMPT = `You write one "Did you know" fact, 2 sentences, for a project-intake form at a marketing/tech booth. The audience is a small-business owner who just told us what they do. The agency builds custom software, custom websites, and custom AI workers.

Rules:
- Exactly 2 sentences, plain prose, no lists, no preamble.
- No "Did you know" prefix (the UI adds that).
- Fact must be genuinely interesting and specific to their industry. Avoid vague "technology is transforming..." filler.
- Bridge the fact to something software / AI / automation could do for that kind of business. Do not pitch, do not use "we" or "our".
- Do not invent statistics. If unsure, say something structural about the industry instead.

Return only the 2 sentences.`;

const TIMEOUT_MS = 4000;

function ok(fact: string) {
  return NextResponse.json({ success: true, fact });
}

function fail(error: string) {
  return NextResponse.json({ success: false, error });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fail("missing-key");

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail("bad-json");
  }

  const description = (body.businessDescription ?? "").trim();
  if (description.length < 3 || description.length > 240) {
    return fail("bad-description");
  }

  const client = new Anthropic({ apiKey });

  const call = client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 160,
    temperature: 0.5,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: `Business description: "${description}"` },
    ],
  });

  const timeout = new Promise<"timeout">((resolve) =>
    setTimeout(() => resolve("timeout"), TIMEOUT_MS),
  );

  try {
    const result = await Promise.race([call, timeout]);
    if (result === "timeout") return fail("timeout");

    const block = result.content.find((b) => b.type === "text");
    const fact = block && block.type === "text" ? block.text.trim() : "";
    if (!fact) return fail("empty");

    return ok(fact);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return fail(`api-error:${msg}`);
  }
}
