import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/firebase/business";
import { getAdminDb } from "@/lib/firebase/admin";
import { normalizePhone } from "@/lib/phone";
import { isValidSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = body?.slug ? String(body.slug) : "";
  const reservaId = body?.reservaId ? String(body.reservaId) : "";
  const telefono = body?.telefono ? normalizePhone(String(body.telefono)) : "";

  if (!isValidSlug(slug) || !reservaId || !telefono) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ ok: false, error: "business_not_found" }, { status: 404 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "firebase_not_configured" }, { status: 503 });
  }

  const reservaRef = db.collection("negocios").doc(business.id).collection("reservas").doc(reservaId);

  try {
    await db.runTransaction(async (transaction) => {
      const reservaDoc = await transaction.get(reservaRef);
      if (!reservaDoc.exists) {
        throw new Error("reservation_not_found");
      }

      const data = reservaDoc.data() ?? {};
      if (data.telefonoNormalizado !== telefono) {
        throw new Error("phone_mismatch");
      }

      transaction.update(reservaRef, {
        estado: "cancelada",
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      const occupiedId = data.horarioOcupadoId ?? data.bloqueoId;
      if (occupiedId) {
        transaction.delete(db.collection("negocios").doc(business.id).collection("horariosOcupados").doc(String(occupiedId)));
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "cancel_failed";
    const status = message === "reservation_not_found" ? 404 : message === "phone_mismatch" ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }

  return NextResponse.json({ ok: true });
}
