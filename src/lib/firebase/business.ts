import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./admin";
import type { LeadInterestPlan, PublicBusiness, PublicService } from "@/types/tenant";

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

  const snapshot = await db.collection("negocios").doc(negocioId).collection("servicios").where("activo", "==", true).orderBy("orden", "asc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre ?? "Servicio",
      duracionMin: data.duracionMin ?? 30,
      precio: data.precio,
      activo: data.activo !== false
    };
  });
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
