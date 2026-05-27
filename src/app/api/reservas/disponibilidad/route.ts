import { NextResponse } from "next/server";
import { cleanText, isIsoDate, readJsonRequest } from "@/lib/api/request";
import { getAvailableTimes } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await readJsonRequest(request, 3_000);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.body;
  const slug = cleanText(body.slug, 80);
  const serviceId = cleanText(body.serviceId, 100);
  const date = cleanText(body.date, 10);
  const personalId = cleanText(body.personalId, 100);
  const sucursalId = cleanText(body.sucursalId, 100);

  if (!slug || !serviceId || !isIsoDate(date)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const result = await getAvailableTimes({
    slug,
    serviceId,
    date,
    personalId: personalId || undefined,
    sucursalId: sucursalId || undefined
  });

  if (!result.ok) {
    const status =
      result.error === "business_not_found"
        ? 404
        : result.error === "firebase_not_configured"
          ? 503
          : result.error === "staff_branch_mismatch"
            ? 409
            : 400;
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" }, status });
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
