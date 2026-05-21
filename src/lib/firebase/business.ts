import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./admin";
import type { LeadInterestPlan, PublicBranch, PublicBusiness, PublicScheduleConfig, PublicService, PublicStaff } from "@/types/tenant";

const demoBusiness: PublicBusiness = {
  id: "demo-victorias-estetica",
  nombre: "Victoria's Estética",
  slug: "victorias-estetica",
  plan: "agenda_simple",
  estado: "trial",
  activo: true,
  billingStatus: "manual_active",
  ownerNombre: "Victoria",
  ownerEmail: "demo@tuagendaweb.com.ar",
  ownerTelefono: "+54 9 381 000 0000",
  initials: "VE",
  colorPrimario: "#123D3A",
  colorSecundario: "#E7B85A",
  whatsapp: "5493815746066",
  rubro: "Estética",
  monthlyPrice: 10000
};

const demoServices: PublicService[] = [
  { id: "limpieza-facial", nombre: "Limpieza facial", duracionMin: 60, precio: 12000, activo: true },
  { id: "perfilado-cejas", nombre: "Perfilado de cejas", duracionMin: 40, precio: 7000, activo: true },
  { id: "masaje-relax", nombre: "Masaje relax", duracionMin: 60, precio: 15000, activo: true }
];

export const defaultScheduleConfig: PublicScheduleConfig = {
  diasAtencion: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  horarioInicio: "09:00",
  horarioFin: "18:00",
  intervaloMin: 30,
  diasReservaMax: 21,
  anticipacionHoras: 1
};

function serializeBusiness(id: string, data: FirebaseFirestore.DocumentData): PublicBusiness {
  return {
    id,
    nombre: data.nombre ?? data.nombreNegocio ?? "Negocio",
    slug: data.slug,
    plan: data.plan ?? "agenda_simple",
    estado: data.estado ?? "trial",
    activo: data.activo !== false,
    billingStatus: data.billingStatus ?? "manual_pending",
    ownerNombre: data.ownerNombre,
    ownerTelefono: data.ownerTelefono,
    ownerEmail: data.ownerEmail,
    logoUrl: data.logoUrl,
    initials: data.initials,
    colorPrimario: data.colorPrimario,
    colorSecundario: data.colorSecundario,
    whatsapp: data.whatsapp,
    instagram: data.instagram,
    rubro: data.rubro,
    customDomain: data.customDomain,
    monthlyPrice: data.monthlyPrice,
    nextPaymentDue: data.nextPaymentDue
  };
}

function sortByName<T extends { nombre: string }>(items: T[]) {
  return items.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export async function getBusinessBySlug(slug: string) {
  if (slug === demoBusiness.slug) return demoBusiness;

  const db = getAdminDb();
  if (!db) return null;

  const snapshot = await db.collection("negocios").where("slug", "==", slug).limit(1).get();
  const doc = snapshot.docs[0];
  return doc ? serializeBusiness(doc.id, doc.data()) : null;
}

export async function getPublicServices(negocioId: string) {
  if (negocioId === demoBusiness.id) return demoServices;

  const db = getAdminDb();
  if (!db) return [];

  const snapshot = await db.collection("negocios").doc(negocioId).collection("servicios").where("activo", "==", true).get();
  return sortByName(snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre ?? "Servicio",
      duracionMin: data.duracionMin ?? 30,
      precio: data.precio,
      activo: data.activo !== false
    };
  }));
}

export async function getPublicStaff(negocioId: string): Promise<PublicStaff[]> {
  if (negocioId === demoBusiness.id) return [{ id: "victoria", nombre: "Victoria", especialidad: "Estética integral", activo: true }];

  const db = getAdminDb();
  if (!db) return [];

  const snapshot = await db.collection("negocios").doc(negocioId).collection("personal").where("activo", "==", true).get();
  return sortByName(snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre ?? "Profesional",
      especialidad: data.especialidad,
      activo: data.activo !== false
    };
  }));
}

export async function getPublicBranches(negocioId: string): Promise<PublicBranch[]> {
  if (negocioId === demoBusiness.id) return [{ id: "principal", nombre: "Sucursal principal", direccion: "Tucumán", activo: true }];

  const db = getAdminDb();
  if (!db) return [];

  const snapshot = await db.collection("negocios").doc(negocioId).collection("sucursales").where("activo", "==", true).get();
  return sortByName(snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre ?? "Sucursal",
      direccion: data.direccion,
      activo: data.activo !== false
    };
  }));
}

export async function getPublicScheduleConfig(negocioId: string): Promise<PublicScheduleConfig> {
  if (negocioId === demoBusiness.id) return defaultScheduleConfig;

  const db = getAdminDb();
  if (!db) return defaultScheduleConfig;

  const snapshot = await db.collection("negocios").doc(negocioId).collection("configuracion").doc("general").get();
  const data = snapshot.data();

  return {
    diasAtencion: Array.isArray(data?.diasAtencion) && data.diasAtencion.length ? data.diasAtencion.map(String) : defaultScheduleConfig.diasAtencion,
    horarioInicio: typeof data?.horarioInicio === "string" ? data.horarioInicio : defaultScheduleConfig.horarioInicio,
    horarioFin: typeof data?.horarioFin === "string" ? data.horarioFin : defaultScheduleConfig.horarioFin,
    intervaloMin: Number.isFinite(Number(data?.intervaloMin)) ? Math.max(5, Number(data?.intervaloMin)) : defaultScheduleConfig.intervaloMin,
    diasReservaMax: Number.isFinite(Number(data?.diasReservaMax)) ? Math.max(1, Number(data?.diasReservaMax)) : defaultScheduleConfig.diasReservaMax,
    anticipacionHoras: Number.isFinite(Number(data?.anticipacionHoras)) ? Math.max(0, Number(data?.anticipacionHoras)) : defaultScheduleConfig.anticipacionHoras
  };
}

export async function createLandingLead(input: {
  name: string;
  phone: string;
  businessName: string;
  businessType: string;
  interestedPlan: LeadInterestPlan;
  message?: string;
  source?: string;
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  capturedAt?: string;
  userAgent?: string;
  priority?: "normal" | "medium" | "high";
}) {
  const db = getAdminDb();
  if (!db) return { ok: false, reason: "firebase_not_configured" as const };

  await db.collection("leads").add({
    ...input,
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  return { ok: true as const };
}

export function canReserveBusiness(business: PublicBusiness) {
  return business.activo && (business.estado === "trial" || business.estado === "active");
}
