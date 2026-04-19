import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  services?: string[];
  budget?: string;
  timeline?: string;
  notes?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: Request) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    return bad("Server is not configured. Missing APPS_SCRIPT_URL.", 500);
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return bad("Invalid JSON body.");
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const company = (body.company ?? "").trim();
  const services = Array.isArray(body.services) ? body.services.filter(Boolean) : [];
  const budget = (body.budget ?? "").trim();
  const timeline = (body.timeline ?? "").trim();
  const notes = (body.notes ?? "").trim();

  if (!name) return bad("Name is required.");
  if (!email || !EMAIL_RE.test(email)) return bad("A valid email is required.");
  if (services.length === 0) return bad("Select at least one service.");
  if (!budget) return bad("Budget is required.");
  if (!timeline) return bad("Timeline is required.");

  const payload = {
    name,
    email,
    phone,
    company,
    services: services.join(", "),
    budget,
    timeline,
    notes,
  };

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await upstream.text();
    let parsed: { success?: boolean; error?: string } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      return bad(`Upstream returned non-JSON response (status ${upstream.status}).`, 502);
    }

    if (!upstream.ok || !parsed.success) {
      return bad(parsed.error || `Upstream error (status ${upstream.status}).`, 502);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error.";
    return bad(`Failed to reach the sheet: ${msg}`, 502);
  }
}
