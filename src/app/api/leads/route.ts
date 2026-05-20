import { NextResponse } from "next/server";
import { createLandingLead } from "@/lib/firebase/business";
import type { LeadInterestPlan } from "@/types/tenant";

export const dynamic = "force-dynamic";

const allowedPlans = new Set<LeadInterestPlan>(["agenda_simple", "agenda_pro", "web_completa", "not_sure"]);

function clean(value: unknown, maxLength: number) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

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
  const phone = clean(body.phone, 40);
  const businessName = clean(body.businessName, 100);
  const businessType = clean(body.businessType, 80);

  if (name.length < 2 || phone.length < 6 || businessName.length < 2 || businessType.length < 2) {
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
    utmTerm: body.utmTerm ? clean(body.utmTerm, 120) : undefined
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
