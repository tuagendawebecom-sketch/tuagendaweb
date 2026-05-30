import { cleanText, jsonNoStore, readJsonRequest } from "@/lib/api/request";
import { createLandingLead } from "@/lib/firebase/business";
import { normalizePhone } from "@/lib/phone";
import type { LeadInterestPlan } from "@/types/tenant";

export const dynamic = "force-dynamic";

const allowedPlans = new Set<LeadInterestPlan>(["agenda_simple", "web_completa", "not_sure"]);
const leadHits = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, maxLength: number) {
  return cleanText(value, maxLength);
}

export async function POST(request: Request) {
  const parsed = await readJsonRequest(request, 12_000);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.body;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const hit = leadHits.get(ip);

  if (hit && hit.resetAt > now && hit.count >= 8) {
    return jsonNoStore({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  leadHits.set(ip, hit && hit.resetAt > now ? { count: hit.count + 1, resetAt: hit.resetAt } : { count: 1, resetAt: now + 10 * 60 * 1000 });

  if (body?.company) {
    return jsonNoStore({ ok: true });
  }

  if (!body?.name || !body?.phone || !body?.businessName || !body?.businessType || !body?.interestedPlan) {
    return jsonNoStore({ ok: false, error: "missing_required_fields" }, { status: 400 });
  }

  const interestedPlan = clean(body.interestedPlan, 32) as LeadInterestPlan;

  if (!allowedPlans.has(interestedPlan)) {
    return jsonNoStore({ ok: false, error: "invalid_plan" }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const phone = normalizePhone(clean(body.phone, 40));
  const businessName = clean(body.businessName, 100);
  const businessType = clean(body.businessType, 80);
  const priority = interestedPlan === "web_completa" ? "high" : interestedPlan === "not_sure" ? "medium" : "normal";

  if (name.length < 2 || phone.length < 10 || businessName.length < 2 || businessType.length < 2) {
    return jsonNoStore({ ok: false, error: "invalid_fields" }, { status: 400 });
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
    return jsonNoStore({ ok: false, error: result.reason }, { status: 503 });
  }

  return jsonNoStore({ ok: true });
}
