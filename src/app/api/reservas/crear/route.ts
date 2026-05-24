import { NextResponse } from "next/server";
import { cleanText, digitsOnly, isIsoDate, isTime, readJsonRequest } from "@/lib/api/request";
import { createReservation } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await readJsonRequest(request, 8_000);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.body;
  const slug = cleanText(body.slug, 80);
  const serviceId = cleanText(body.serviceId, 100);
  const date = cleanText(body.date, 10);
  const time = cleanText(body.time, 5);
  const clienteNombre = cleanText(body.clienteNombre, 80);
  const telefono = cleanText(body.telefono, 30);
  const personalId = cleanText(body.personalId, 100);
  const sucursalId = cleanText(body.sucursalId, 100);

  if (!slug || !serviceId || !isIsoDate(date) || !isTime(time) || clienteNombre.length < 2 || digitsOnly(telefono).length < 8) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const result = await createReservation({
    slug,
    serviceId,
    date,
    time,
    clienteNombre,
    telefono,
    personalId: personalId || undefined,
    sucursalId: sucursalId || undefined
  }).catch((error) => ({ ok: false as const, error: error instanceof Error ? error.message : "reservation_failed" }));

  if (!result.ok) {
    const status = result.error === "business_not_found" ? 404 : result.error === "firebase_not_configured" ? 503 : result.error === "time_not_available" ? 409 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
