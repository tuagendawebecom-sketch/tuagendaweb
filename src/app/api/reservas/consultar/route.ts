import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/firebase/business";
import { isValidSlug } from "@/lib/slug";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = body?.slug ? String(body.slug) : "";
  const phone = body?.telefono ? String(body.telefono) : "";

  if (!isValidSlug(slug) || !phone) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ ok: false, error: "business_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    reservas: [],
    note: "Consulta pública preparada. Migrar aquí findActivePublicReservationsByPhone desde turnero-mvp resolviendo negocio por slug server-side."
  });
}
