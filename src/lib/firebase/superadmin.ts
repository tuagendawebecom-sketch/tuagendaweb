import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function requireSuperAdmin(request: Request) {
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return { ok: false as const, error: "firebase_admin_not_configured" };

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  if (!token) return { ok: false as const, error: "missing_token" };

  try {
    const decoded = await auth.verifyIdToken(token);
    const userSnapshot = await db.collection("businessUsers").doc(decoded.uid).get();
    const userData = userSnapshot.data();

    if (userData?.role !== "superadmin" || userData?.isActive !== true) {
      return { ok: false as const, error: "forbidden" };
    }

    return { ok: true as const, uid: decoded.uid, db, auth };
  } catch {
    return { ok: false as const, error: "invalid_token" };
  }
}
