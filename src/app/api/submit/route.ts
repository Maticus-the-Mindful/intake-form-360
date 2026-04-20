import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  businessDescription?: string;
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
  const businessDescription = (body.businessDescription ?? "").trim().slice(0, 500);
  const services = Array.isArray(body.services) ? body.services.filter(Boolean) : [];
  const budget = (body.budget ?? "").trim();
  const timeline = (body.timeline ?? "").trim();
  const notes = (body.notes ?? "").trim();

  if (!name) return bad("Name is required.");
  if (!email || !EMAIL_RE.test(email)) return bad("A valid email is required.");
  if (!businessDescription) return bad("A business description is required.");
  if (services.length === 0) return bad("Select at least one service.");
  if (!budget) return bad("Budget is required.");
  if (!timeline) return bad("Timeline is required.");

  const payload = {
    name,
    email,
    phone,
    company,
    businessDescription,
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

    await sendConfirmationEmail({ name, email, services, businessDescription });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error.";
    return bad(`Failed to reach the sheet: ${msg}`, 502);
  }
}

async function sendConfirmationEmail(args: {
  name: string;
  email: string;
  services: string[];
  businessDescription: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.warn("[submit] Skipping confirmation email: RESEND_API_KEY or RESEND_FROM missing.");
    return;
  }

  const replyTo = process.env.RESEND_REPLY_TO;
  const firstName = args.name.split(/\s+/)[0] || args.name;
  const servicesList = args.services.join(", ");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: args.email,
      replyTo,
      subject: "Thanks for stopping by The Big Table 2026",
      text: buildText(firstName, servicesList),
      html: buildHtml(firstName, servicesList),
    });
    if (error) {
      console.error("[submit] Resend error:", error);
    }
  } catch (err) {
    console.error("[submit] Failed to send confirmation email:", err);
  }
}

function buildText(firstName: string, servicesList: string) {
  return [
    `Hey ${firstName},`,
    "",
    `Thanks for stopping by the Maticus Media 360 booth at The Big Table 2026 and sharing what you're working on.`,
    "",
    servicesList
      ? `I've got your notes on: ${servicesList}. I'll review everything and reach out personally within two business days with next steps.`
      : `I've got your notes and I'll review everything and reach out personally within two business days with next steps.`,
    "",
    "In the meantime, if anything new comes up, just reply to this email — it comes straight to me.",
    "",
    "Talk soon,",
    "Maticus",
    "Maticus Media 360",
  ].join("\n");
}

function buildHtml(firstName: string, servicesList: string) {
  const servicesLine = servicesList
    ? `I&rsquo;ve got your notes on <strong>${escapeHtml(servicesList)}</strong>. I&rsquo;ll review everything and reach out personally within two business days with next steps.`
    : `I&rsquo;ve got your notes and I&rsquo;ll review everything and reach out personally within two business days with next steps.`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f5f5f7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b10;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#15151c;border:1px solid #2a2a36;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#a1a1aa;">Maticus Media 360</div>
                <h1 style="margin:12px 0 0 0;font-size:24px;line-height:1.25;color:#ffffff;">Thanks for stopping by, ${escapeHtml(firstName)}.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 8px 28px;font-size:16px;line-height:1.6;color:#e4e4e7;">
                <p style="margin:0 0 16px 0;">Great meeting you at <strong>The Big Table 2026</strong>. I appreciate you taking two minutes at the booth to tell me about your business.</p>
                <p style="margin:0 0 16px 0;">${servicesLine}</p>
                <p style="margin:0 0 16px 0;">If anything new comes up in the meantime, just reply to this email &mdash; it comes straight to me.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px 28px;font-size:16px;line-height:1.6;color:#e4e4e7;">
                <p style="margin:0;">Talk soon,</p>
                <p style="margin:0;font-weight:600;color:#ffffff;">Maticus</p>
                <p style="margin:0;color:#a1a1aa;font-size:14px;">Maticus Media 360</p>
              </td>
            </tr>
          </table>
          <div style="max-width:560px;margin-top:16px;font-size:12px;color:#71717a;text-align:center;">
            You're receiving this because you filled out the intake form at The Big Table 2026.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
