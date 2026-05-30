import { cleanText, digitsOnly, jsonNoStore, readJsonRequest } from "@/lib/api/request";
import { cancelReservation } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await readJsonRequest(request, 2_000);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.body;
  const slug = cleanText(body.slug, 80);
  const reservaId = cleanText(body.reservaId, 120);
  const telefono = cleanText(body.telefono, 30);

  if (!slug || !reservaId || digitsOnly(telefono).length < 10) {
    return jsonNoStore({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const result = await cancelReservation({
    slug,
    reservaId,
    telefono
  }).catch((error) => ({ ok: false as const, error: error instanceof Error ? error.message : "cancel_failed" }));

  if (!result.ok) {
    const status = result.error === "business_not_found" || result.error === "reservation_not_found" ? 404 : result.error === "phone_mismatch" ? 403 : result.error === "firebase_not_configured" ? 503 : 400;
    return jsonNoStore(result, { status });
  }

  return jsonNoStore({ ok: true });
}
