import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/firebase/business";
import { isValidSlug } from "@/lib/slug";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = body?.slug ? String(body.slug) : "";
  const reservaId = body?.reservaId ? String(body.reservaId) : "";
  const telefono = body?.telefono ? String(body.telefono) : "";

  if (!isValidSlug(slug) || !reservaId || !telefono) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ ok: false, error: "business_not_found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "not_implemented",
      note: "Cancelación preparada. Migrar cancelPublicReservationByPhone desde turnero-mvp, validando teléfono y liberando horariosOcupados por transacción."
    },
    { status: 501 }
  );
}
