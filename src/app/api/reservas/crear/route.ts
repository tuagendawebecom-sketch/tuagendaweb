import { NextResponse } from "next/server";
import { createReservation } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 8_000) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "invalid_content_type" }, { status: 415 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const result = await createReservation({
    slug: String(body?.slug ?? ""),
    serviceId: String(body?.serviceId ?? ""),
    date: String(body?.date ?? ""),
    time: String(body?.time ?? ""),
    clienteNombre: String(body?.clienteNombre ?? ""),
    telefono: String(body?.telefono ?? ""),
    personalId: body?.personalId ? String(body.personalId) : undefined,
    sucursalId: body?.sucursalId ? String(body.sucursalId) : undefined
  }).catch((error) => ({ ok: false as const, error: error instanceof Error ? error.message : "reservation_failed" }));

  if (!result.ok) {
    const status = result.error === "business_not_found" ? 404 : result.error === "firebase_not_configured" ? 503 : result.error === "time_not_available" ? 409 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
