import { NextResponse } from "next/server";
import { createLandingLead } from "@/lib/firebase/business";
import { normalizePhone } from "@/lib/phone";
import type { LeadInterestPlan } from "@/types/tenant";

export const dynamic = "force-dynamic";

const allowedPlans = new Set<LeadInterestPlan>(["agenda_simple", "web_completa", "not_sure"]);
const leadHits = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, maxLength: number) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 12_000) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "invalid_content_type" }, { status: 415 });
  }

  const body = await request.json().catch(() => null);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const hit = leadHits.get(ip);

  if (hit && hit.resetAt > now && hit.count >= 8) {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  leadHits.set(ip, hit && hit.resetAt > now ? { count: hit.count + 1, resetAt: hit.resetAt } : { count: 1, resetAt: now + 10 * 60 * 1000 });

  if (body?.company) {
    return NextResponse.json({ ok: true });
  }

  if (!body?.name || !body?.phone || !body?.businessName || !body?.businessType || !body?.interestedPlan) {
    return NextResponse.json({ ok: false, error: "missing_required_fields" }, { status: 400 });
  }

  const interestedPlan = clean(body.interestedPlan, 32) as LeadInterestPlan;

  if (!allowedPlans.has(interestedPlan)) {
    return NextResponse.json({ ok: false, error: "invalid_plan" }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const phone = normalizePhone(clean(body.phone, 40));
  const businessName = clean(body.businessName, 100);
  const businessType = clean(body.businessType, 80);
  const priority = interestedPlan === "web_completa" ? "high" : interestedPlan === "not_sure" ? "medium" : "normal";

  if (name.length < 2 || phone.length < 10 || businessName.length < 2 || businessType.length < 2) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const result = await createLandingLead({
    name,
    phone,
    businessName,
    businessType,
    interestedPlan,
    message: body.message ? clean(body.message, 600) : undefined,
    source: body.source ? clean(body.source, 60) : "landing",
    path: body.path ? clean(body.path, 160) : undefined,
    referrer: body.referrer ? clean(body.referrer, 240) : request.headers.get("referer") ?? undefined,
    utmSource: body.utmSource ? clean(body.utmSource, 80) : undefined,
    utmMedium: body.utmMedium ? clean(body.utmMedium, 80) : undefined,
    utmCampaign: body.utmCampaign ? clean(body.utmCampaign, 120) : undefined,
    utmContent: body.utmContent ? clean(body.utmContent, 120) : undefined,
    utmTerm: body.utmTerm ? clean(body.utmTerm, 120) : undefined,
    capturedAt: body.capturedAt ? clean(body.capturedAt, 40) : undefined,
    userAgent: clean(request.headers.get("user-agent"), 180),
    priority
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
