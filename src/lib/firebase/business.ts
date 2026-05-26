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

export function buildDefaultWebContent(input: { nombre?: string; rubro?: string } = {}): PublicWebContent {
  const nombre = input.nombre?.trim() || "Tu negocio";
  const rubro = input.rubro?.trim() || "Atencion personalizada";
  const normalizedRubro = rubro.toLowerCase();
  const isBeauty = /estet|belleza|peluquer|unas|cejas|pesta|masaje|spa/.test(normalizedRubro);
  const isShop = /tienda|lencer|ropa|boutique|moda|indumentaria/.test(normalizedRubro);

  const heroTitulo = isShop
    ? `${nombre}: una experiencia cuidada para conocer, consultar y reservar`
    : `${nombre}: reservas online y atencion profesional`;
  const heroSubtitulo = isBeauty
    ? `Conoce los servicios de ${nombre}, elegi profesional, dia y horario, y reserva desde el celular con una experiencia simple y prolija.`
    : isShop
      ? `Descubri la propuesta de ${nombre}, consulta por WhatsApp y reserva una atencion personalizada desde el celular.`
      : `Conoce la propuesta de ${nombre}, revisa disponibilidad y reserva tu turno desde el celular.`;

  return {
    heroEtiqueta: rubro,
    heroTitulo,
    heroSubtitulo,
    ctaPrincipalTexto: "Reservar turno",
    sobreTitulo: `Sobre ${nombre}`,
    sobreTexto: `${nombre} cuenta con una web propia para mostrar su propuesta, ordenar consultas y recibir reservas online de forma clara para cada cliente.`,
    beneficiosTitulo: "Una forma mas simple de atender",
    beneficio1Titulo: "Reserva desde el celular",
    beneficio1Texto: "El cliente puede elegir servicio, dia y horario sin esperar una respuesta manual.",
    beneficio2Titulo: "Informacion clara",
    beneficio2Texto: "Servicios, horarios, contacto y redes quedan reunidos en una experiencia profesional.",
    beneficio3Titulo: "Mejor organizacion",
    beneficio3Texto: "Cada reserva queda registrada para que el negocio pueda administrar su agenda desde el panel.",
    finalCtaTitulo: `Reserva en ${nombre}`,
    finalCtaTexto: "Elegi servicio, profesional, sucursal, dia y horario desde esta misma pagina.",
    heroImageUrl: "",
    mapaLinkUrl: "",
    facebook: ""
  };
}

export const defaultWebContent: PublicWebContent = buildDefaultWebContent();

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

function readText(data: FirebaseFirestore.DocumentData | undefined, key: keyof PublicWebContent, defaults: PublicWebContent) {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : defaults[key];
}

export async function getPublicWebContent(negocioId: string, business?: Pick<PublicBusiness, "nombre" | "rubro">): Promise<PublicWebContent> {
  const defaults = buildDefaultWebContent({ nombre: business?.nombre, rubro: business?.rubro });
  const db = getAdminDb();
  if (!db) return defaults;

  const snapshot = await db.collection("negocios").doc(negocioId).collection("configuracion").doc("general").get();
  const data = snapshot.data();

  return {
    heroEtiqueta: readText(data, "heroEtiqueta", defaults),
    heroTitulo: readText(data, "heroTitulo", defaults),
    heroSubtitulo: readText(data, "heroSubtitulo", defaults),
    ctaPrincipalTexto: readText(data, "ctaPrincipalTexto", defaults),
    sobreTitulo: readText(data, "sobreTitulo", defaults),
    sobreTexto: readText(data, "sobreTexto", defaults),
    beneficiosTitulo: readText(data, "beneficiosTitulo", defaults),
    beneficio1Titulo: readText(data, "beneficio1Titulo", defaults),
    beneficio1Texto: readText(data, "beneficio1Texto", defaults),
    beneficio2Titulo: readText(data, "beneficio2Titulo", defaults),
    beneficio2Texto: readText(data, "beneficio2Texto", defaults),
    beneficio3Titulo: readText(data, "beneficio3Titulo", defaults),
    beneficio3Texto: readText(data, "beneficio3Texto", defaults),
    finalCtaTitulo: readText(data, "finalCtaTitulo", defaults),
    finalCtaTexto: readText(data, "finalCtaTexto", defaults),
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
