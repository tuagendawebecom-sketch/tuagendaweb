import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { isValidSlug, normalizeSlug } from "@/lib/slug";
import { requireSuperAdmin } from "@/lib/firebase/superadmin";
import type { BusinessPlan } from "@/types/tenant";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCustomDomain(value: unknown) {
  const raw = clean(value).toLowerCase();
  if (!raw) return "";
  return raw
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

function isValidCustomDomain(value: string) {
  if (!value) return true;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(value);
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function planPrice(plan: BusinessPlan) {
  if (plan === "agenda_simple") return 10000;
  if (plan === "agenda_pro") return 20000;
  return 0;
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addMonths(dateKey: string, months: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

const defaultScheduleConfig = {
  intervaloMin: 30,
  diasReservaMax: 21,
  anticipacionHoras: 1,
  diasAtencion: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  horariosPorDia: {
    lunes: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
    martes: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
    miércoles: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
    jueves: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
    viernes: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
    sábado: { activo: true, rangos: [{ inicio: "09:00", fin: "13:00" }] },
    domingo: { activo: false, rangos: [] }
  }
};

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 12_000) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "invalid_content_type" }, { status: 415 });
  }

  const admin = await requireSuperAdmin(request);
  if (!admin.ok) {
    const status = admin.error === "firebase_admin_not_configured" ? 503 : admin.error === "forbidden" ? 403 : 401;
    return NextResponse.json({ ok: false, error: admin.error }, { status });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const nombre = clean(body?.nombre);
  const slug = normalizeSlug(clean(body?.slug) || nombre);
  const plan = (clean(body?.plan) || "agenda_simple") as BusinessPlan;
  const ownerEmail = clean(body?.ownerEmail).toLowerCase();
  const initialPassword = clean(body?.initialPassword);
  const updateExistingPassword = body?.updateExistingPassword === true;
  const signupDate = isDateKey(clean(body?.signupDate)) ? clean(body?.signupDate) : todayKey();
  const nextPaymentDue = isDateKey(clean(body?.nextPaymentDue)) ? clean(body?.nextPaymentDue) : addMonths(signupDate, 1);
  const customDomain = normalizeCustomDomain(body?.customDomain);

  if (!nombre || !isValidSlug(slug)) {
    return NextResponse.json({ ok: false, error: "invalid_business" }, { status: 400 });
  }

  if (!["agenda_simple", "agenda_pro", "web_completa"].includes(plan)) {
    return NextResponse.json({ ok: false, error: "invalid_plan" }, { status: 400 });
  }

  if (!ownerEmail || initialPassword.length < 6) {
    return NextResponse.json({ ok: false, error: "invalid_owner_credentials" }, { status: 400 });
  }

  if (!isValidCustomDomain(customDomain)) {
    return NextResponse.json({ ok: false, error: "invalid_custom_domain" }, { status: 400 });
  }

  const duplicateSnapshot = await admin.db.collection("negocios").where("slug", "==", slug).limit(1).get();
  if (!duplicateSnapshot.empty) {
    const duplicate = duplicateSnapshot.docs[0];
    const duplicateData = duplicate.data();
    const canReleaseSlug = duplicateData.archived === true || duplicateData.estado === "cancelled";

    if (!canReleaseSlug) {
      return NextResponse.json({ ok: false, error: "slug_already_exists" }, { status: 409 });
    }

    await duplicate.ref.update({
      slug: `${slug}-archivado-${Date.now()}`,
      archived: true,
      activo: false,
      estado: "cancelled",
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  if (customDomain) {
    const domainSnapshot = await admin.db.collection("negocios").where("customDomain", "==", customDomain).limit(1).get();
    const domainOwner = domainSnapshot.docs[0];
    if (domainOwner && domainOwner.data().archived !== true && domainOwner.data().estado !== "cancelled") {
      return NextResponse.json({ ok: false, error: "custom_domain_already_exists" }, { status: 409 });
    }
  }

  let owner;
  try {
    owner = await admin.auth.getUserByEmail(ownerEmail);
    if (updateExistingPassword) {
      owner = await admin.auth.updateUser(owner.uid, { password: initialPassword, displayName: clean(body?.ownerNombre) || owner.displayName });
    }
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "auth/user-not-found") {
      return NextResponse.json({ ok: false, error: "owner_lookup_failed" }, { status: 400 });
    }

    owner = await admin.auth.createUser({
      email: ownerEmail,
      password: initialPassword,
      displayName: clean(body?.ownerNombre) || nombre,
      emailVerified: false,
      disabled: false
    });
  }

  const businessRef = await admin.db.collection("negocios").add({
    nombre,
    slug,
    plan,
    estado: "trial",
    activo: true,
    archived: false,
    billingStatus: "manual_active",
    rubro: clean(body?.rubro),
    ownerNombre: clean(body?.ownerNombre),
    ownerEmail,
    ownerTelefono: clean(body?.ownerTelefono),
    whatsapp: normalizePhone(clean(body?.whatsapp)),
    instagram: clean(body?.instagram),
    logoUrl: clean(body?.logoUrl),
    customDomain,
    initials: initialsFromName(nombre),
    colorPrimario: "#123D3A",
    colorSecundario: "#E7B85A",
    monthlyPrice: planPrice(plan),
    signupDate,
    billingStartDate: signupDate,
    nextPaymentDue,
    lastPaymentAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await admin.db.collection("businessUsers").doc(owner.uid).set({
    negocioId: businessRef.id,
    role: "owner",
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await businessRef.collection("servicios").add({
    nombre: "Servicio inicial",
    duracionMin: 60,
    precio: 0,
    activo: true,
    orden: 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await businessRef.collection("configuracion").doc("general").set({
    ...defaultScheduleConfig,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  return NextResponse.json({
    ok: true,
    businessId: businessRef.id,
    slug,
    ownerUid: owner.uid,
    ownerEmail
  });
}
