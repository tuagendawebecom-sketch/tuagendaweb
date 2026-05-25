import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./admin";
import type { LeadInterestPlan, PublicBranch, PublicBusiness, PublicScheduleConfig, PublicStaff, PublicWebContent } from "@/types/tenant";

export const defaultScheduleConfig: PublicScheduleConfig = {
  diasAtencion: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  horarioInicio: "09:00",
  horarioFin: "18:00",
  intervaloMin: 30,
  diasReservaMax: 21,
  anticipacionHoras: 1,
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

export const defaultWebContent: PublicWebContent = {
  heroEtiqueta: "Reservas online",
  heroTitulo: "Una experiencia profesional para reservar desde el celular.",
  heroSubtitulo: "Mostramos tus servicios, horarios, profesionales y formas de contacto en una web clara para que tus clientes puedan pedir turno sin vueltas.",
  ctaPrincipalTexto: "Reservar turno",
  sobreTitulo: "Una web pensada para tu forma de atender",
  sobreTexto: "TuAgendaWeb adapta la presencia online del negocio para que cada cliente entienda que ofrecés, cómo reservar y cómo contactarte.",
  beneficiosTitulo: "Por qué ayuda a tu negocio",
  beneficio1Titulo: "Menos mensajes repetidos",
  beneficio1Texto: "El cliente puede ver servicios, elegir día y horario sin esperar respuesta.",
  beneficio2Titulo: "Imagen más profesional",
  beneficio2Texto: "Tu negocio tiene una web propia, clara y alineada con tu identidad.",
  beneficio3Titulo: "Agenda más ordenada",
  beneficio3Texto: "Los turnos quedan registrados y el panel ayuda a revisar reservas, clientes y servicios.",
  finalCtaTitulo: "Reservá tu próximo turno",
  finalCtaTexto: "Elegí servicio, profesional, sucursal, día y horario desde esta misma página.",
  heroImageUrl: "",
  mapaLinkUrl: "",
  facebook: ""
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
  const db = getAdminDb();
  if (!db) return null;

  const snapshot = await db.collection("negocios").where("slug", "==", slug).limit(1).get();
  const doc = snapshot.docs[0];
  if (doc?.data().archived === true) return null;
  return doc ? serializeBusiness(doc.id, doc.data()) : null;
}

export async function getBusinessByCustomDomain(hostname: string) {
  const db = getAdminDb();
  if (!db) return null;

  const rawHost = hostname.toLowerCase().split(":")[0];
  const normalizedHost = rawHost.replace(/^www\./, "");
  if (!normalizedHost) return null;

  const candidates = Array.from(new Set([normalizedHost, rawHost].filter(Boolean)));
  const snapshot = await db.collection("negocios").where("customDomain", "in", candidates).limit(1).get();
  const doc = snapshot.docs[0];
  if (doc?.data().archived === true) return null;
  return doc ? serializeBusiness(doc.id, doc.data()) : null;
}

export async function getPublicServices(negocioId: string) {
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
      activo: data.activo !== false,
      personalIds: Array.isArray(data.personalIds) ? data.personalIds.map(String) : [],
      sucursalIds: Array.isArray(data.sucursalIds) ? data.sucursalIds.map(String) : []
    };
  }));
}

export async function getPublicStaff(negocioId: string): Promise<PublicStaff[]> {
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
  const db = getAdminDb();
  if (!db) return defaultScheduleConfig;

  const snapshot = await db.collection("negocios").doc(negocioId).collection("configuracion").doc("general").get();
  const data = snapshot.data();
  const rawHorariosPorDia = data?.horariosPorDia && typeof data.horariosPorDia === "object" ? data.horariosPorDia as Record<string, unknown> : null;
  const horariosPorDia = rawHorariosPorDia
    ? Object.fromEntries(
        Object.entries(rawHorariosPorDia).map(([day, value]) => {
          const item = value && typeof value === "object" ? value as { activo?: unknown; rangos?: unknown } : {};
          const rangos = Array.isArray(item.rangos)
            ? item.rangos
                .map((range) => {
                  const rangeData = range && typeof range === "object" ? range as { inicio?: unknown; fin?: unknown } : {};
                  return { inicio: String(rangeData.inicio ?? ""), fin: String(rangeData.fin ?? "") };
                })
                .filter((range) => range.inicio && range.fin)
            : [];
          return [day, { activo: item.activo === true, rangos }];
        })
      )
    : undefined;

  return {
    diasAtencion: Array.isArray(data?.diasAtencion) && data.diasAtencion.length ? data.diasAtencion.map(String) : defaultScheduleConfig.diasAtencion,
    horarioInicio: typeof data?.horarioInicio === "string" ? data.horarioInicio : defaultScheduleConfig.horarioInicio,
    horarioFin: typeof data?.horarioFin === "string" ? data.horarioFin : defaultScheduleConfig.horarioFin,
    intervaloMin: Number.isFinite(Number(data?.intervaloMin)) ? Math.max(5, Number(data?.intervaloMin)) : defaultScheduleConfig.intervaloMin,
    diasReservaMax: Number.isFinite(Number(data?.diasReservaMax)) ? Math.max(1, Number(data?.diasReservaMax)) : defaultScheduleConfig.diasReservaMax,
    anticipacionHoras: Number.isFinite(Number(data?.anticipacionHoras)) ? Math.max(0, Number(data?.anticipacionHoras)) : defaultScheduleConfig.anticipacionHoras,
    horariosPorDia: horariosPorDia ?? defaultScheduleConfig.horariosPorDia
  };
}

function readText(data: FirebaseFirestore.DocumentData | undefined, key: keyof PublicWebContent) {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : defaultWebContent[key];
}

export async function getPublicWebContent(negocioId: string): Promise<PublicWebContent> {
  const db = getAdminDb();
  if (!db) return defaultWebContent;

  const snapshot = await db.collection("negocios").doc(negocioId).collection("configuracion").doc("general").get();
  const data = snapshot.data();

  return {
    heroEtiqueta: readText(data, "heroEtiqueta"),
    heroTitulo: readText(data, "heroTitulo"),
    heroSubtitulo: readText(data, "heroSubtitulo"),
    ctaPrincipalTexto: readText(data, "ctaPrincipalTexto"),
    sobreTitulo: readText(data, "sobreTitulo"),
    sobreTexto: readText(data, "sobreTexto"),
    beneficiosTitulo: readText(data, "beneficiosTitulo"),
    beneficio1Titulo: readText(data, "beneficio1Titulo"),
    beneficio1Texto: readText(data, "beneficio1Texto"),
    beneficio2Titulo: readText(data, "beneficio2Titulo"),
    beneficio2Texto: readText(data, "beneficio2Texto"),
    beneficio3Titulo: readText(data, "beneficio3Titulo"),
    beneficio3Texto: readText(data, "beneficio3Texto"),
    finalCtaTitulo: readText(data, "finalCtaTitulo"),
    finalCtaTexto: readText(data, "finalCtaTexto"),
    heroImageUrl: typeof data?.heroImageUrl === "string" ? data.heroImageUrl.trim() : "",
    mapaLinkUrl: typeof data?.mapaLinkUrl === "string" ? data.mapaLinkUrl.trim() : "",
    facebook: typeof data?.facebook === "string" ? data.facebook.trim() : ""
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
