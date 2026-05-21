import { NextResponse } from "next/server";
import { cancelReservation } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

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
