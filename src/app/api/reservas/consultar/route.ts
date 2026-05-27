import { NextResponse } from "next/server";
import { cleanText, digitsOnly, readJsonRequest } from "@/lib/api/request";
import { findReservationsByPhone } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await readJsonRequest(request, 2_000);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.body;
  const slug = cleanText(body.slug, 80);
  const telefono = cleanText(body.telefono, 30);

  if (!slug || digitsOnly(telefono).length < 10) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const result = await findReservationsByPhone({
    slug,
    telefono
  });

  if (!result.ok) {
    const status = result.error === "business_not_found" ? 404 : result.error === "firebase_not_configured" ? 503 : 400;
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" }, status });
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
