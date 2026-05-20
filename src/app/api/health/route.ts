import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "tuagendaweb",
    firebaseClientConfigured: isFirebaseClientConfigured(),
    firebaseAdminConfigured: isFirebaseAdminConfigured(),
    timestamp: new Date().toISOString()
  });
}
