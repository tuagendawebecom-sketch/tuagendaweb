import { NextResponse } from "next/server";
import { cancelReservation } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4_000) {
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

  const result = await cancelReservation({
    slug: String(body?.slug ?? ""),
    reservaId: String(body?.reservaId ?? ""),
    telefono: String(body?.telefono ?? "")
  }).catch((error) => ({ ok: false as const, error: error instanceof Error ? error.message : "cancel_failed" }));

  if (!result.ok) {
    const status = result.error === "business_not_found" || result.error === "reservation_not_found" ? 404 : result.error === "phone_mismatch" ? 403 : result.error === "firebase_not_configured" ? 503 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({ ok: true });
}
