import { NextResponse } from "next/server";
import { createLandingLead } from "@/lib/firebase/business";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.phone || !body?.businessName || !body?.businessType || !body?.interestedPlan) {
    return NextResponse.json({ ok: false, error: "missing_required_fields" }, { status: 400 });
  }

  const result = await createLandingLead({
    name: String(body.name),
    phone: String(body.phone),
    businessName: String(body.businessName),
    businessType: String(body.businessType),
    interestedPlan: body.interestedPlan,
    message: body.message ? String(body.message) : undefined,
    source: body.source ? String(body.source) : "landing"
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
