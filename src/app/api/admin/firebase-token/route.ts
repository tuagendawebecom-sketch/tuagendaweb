import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function POST() {
  const auth = getAdminAuth();

  if (!auth) {
    return NextResponse.json({ ok: false, error: "firebase_admin_not_configured" }, { headers: { "Cache-Control": "no-store" }, status: 503 });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "session_not_implemented",
      note: "Endpoint reservado para emitir custom token después de validar sesión/role contra businessUsers/{uid}."
    },
    { headers: { "Cache-Control": "no-store" }, status: 501 }
  );
}
