import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/firebase/business";
import { getAdminDb } from "@/lib/firebase/admin";
import { normalizePhone } from "@/lib/phone";
import { isValidSlug } from "@/lib/slug";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = body?.slug ? String(body.slug) : "";
  const phone = body?.telefono ? normalizePhone(String(body.telefono)) : "";

  if (!isValidSlug(slug) || !phone) {
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

  const snapshot = await db
    .collection("negocios")
    .doc(business.id)
    .collection("reservas")
    .where("telefonoNormalizado", "==", phone)
    .where("estado", "in", ["pendiente", "confirmada", "active"])
    .limit(20)
    .get();

  return NextResponse.json({
    ok: true,
    reservas: snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        clienteNombre: data.clienteNombre ?? data.nombreCliente ?? "Cliente",
        servicioNombre: data.servicioNombre ?? data.servicio?.nombre ?? "Servicio",
        fecha: data.fecha ?? data.dia ?? null,
        hora: data.hora ?? data.horario ?? null,
        estado: data.estado ?? "confirmada"
      };
    })
  });
}
