import { NextResponse } from "next/server";
import { getAvailableTimes } from "@/lib/firebase/reservations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const result = await getAvailableTimes({
    slug: String(body?.slug ?? ""),
    serviceId: String(body?.serviceId ?? ""),
    date: String(body?.date ?? ""),
    personalId: body?.personalId ? String(body.personalId) : undefined,
    sucursalId: body?.sucursalId ? String(body.sucursalId) : undefined
  });

  if (!result.ok) {
    const status = result.error === "business_not_found" ? 404 : result.error === "firebase_not_configured" ? 503 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
