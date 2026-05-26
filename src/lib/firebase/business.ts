import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./admin";
import { normalizeSlug } from "@/lib/slug";
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
    ctaSecundarioTexto: "Consultar por WhatsApp",
    landingSubtituloMarca: "Reservas online",
    navServiciosTexto: "Servicios",
    navBeneficiosTexto: "Beneficios",
    navPaquetesTexto: "Opciones",
    navContactoTexto: "Contacto",
    heroCardEtiqueta: "Reserva online",
    heroCardTitulo: "Tu proximo turno empieza aca.",
    heroCardTexto: "Elegis servicio, profesional, dia y horario en pocos pasos.",
    sobreTitulo: `Sobre ${nombre}`,
    sobreTexto: `${nombre} cuenta con una web propia para mostrar su propuesta, ordenar consultas y recibir reservas online de forma clara para cada cliente.`,
    serviciosEtiqueta: "Servicios",
    queHacemosTitulo: isShop ? "Conoce la propuesta y reserva una atencion personalizada." : "Servicios claros y faciles de reservar.",
    queHacemosTexto: isShop
      ? "La web muestra la identidad del negocio, sus datos de contacto y una forma simple de coordinar atencion."
      : "Cada servicio puede mostrar duracion, precio y disponibilidad para que el cliente avance sin dudas.",
    beneficiosEtiqueta: "Beneficios",
    beneficiosTitulo: "Una forma mas simple de atender",
    beneficioDetalleTexto: "Una experiencia mas clara, humana y consistente para cada cliente.",
    beneficio1Titulo: "Reserva desde el celular",
    beneficio1Texto: "El cliente puede elegir servicio, dia y horario sin esperar una respuesta manual.",
    beneficio2Titulo: "Informacion clara",
    beneficio2Texto: "Servicios, horarios, contacto y redes quedan reunidos en una experiencia profesional.",
    beneficio3Titulo: "Mejor organizacion",
    beneficio3Texto: "Cada reserva queda registrada para que el negocio pueda administrar su agenda desde el panel.",
    paquetesEtiqueta: "Opciones",
    paquetesTitulo: "Elegí la opción que mejor se adapte a lo que necesitás.",
    paquete1Nombre: "Atención completa",
    paquete1Texto: "Para clientes que buscan una atención más detallada o personalizada.",
    paquete1Feature1: "Servicio principal",
    paquete1Feature2: "Reserva online",
    paquete1Feature3: "Contacto directo",
    paquete2Nombre: "Servicio destacado",
    paquete2Texto: "La opción ideal para mostrar lo más pedido del negocio.",
    paquete2Feature1: "Duración clara",
    paquete2Feature2: "Profesional asignado",
    paquete2Feature3: "Agenda organizada",
    paquete3Nombre: "Consulta rápida",
    paquete3Texto: "Para resolver una necesidad concreta con una reserva simple.",
    paquete3Feature1: "Turno puntual",
    paquete3Feature2: "Confirmación online",
    paquete3Feature3: "WhatsApp disponible",
    menuEtiqueta: "Experiencia",
    menuTitulo: "Una presencia digital prolija tambien comunica profesionalismo.",
    experiencia1Titulo: "Presencia cuidada",
    experiencia1Texto: "La primera impresión transmite orden, claridad y confianza.",
    experiencia2Titulo: "Detalles visibles",
    experiencia2Texto: "Textos, imagenes, servicios y contacto reducen dudas antes de reservar.",
    experiencia3Titulo: "Experiencia consistente",
    experiencia3Texto: "La misma claridad se mantiene en la web, la reserva y la administracion.",
    faqEtiqueta: "Preguntas frecuentes",
    faqTitulo: "Dudas simples antes de reservar.",
    faq1Pregunta: "Como se confirma un turno?",
    faq1Respuesta: "El cliente elige servicio, dia y horario, deja sus datos y el turno queda registrado.",
    faq2Pregunta: "Puedo consultar antes de reservar?",
    faq2Respuesta: "Si. La web mantiene el contacto por WhatsApp para consultas directas.",
    faq3Pregunta: "Que pasa si un horario ya esta ocupado?",
    faq3Respuesta: "La agenda bloquea horarios duplicados para evitar dos reservas en el mismo tramo.",
    finalCtaEtiqueta: "Proximo paso",
    finalCtaTitulo: `Reserva en ${nombre}`,
    finalCtaTexto: "Elegi servicio, profesional, sucursal, dia y horario desde esta misma pagina.",
    heroImageUrl: "",
    galeriaImageUrl1: "",
    galeriaImageUrl2: "",
    seccion5ImageUrl: "",
    direccion: "",
    zonaAtencion: rubro,
    contactoTitulo: "Contacto",
    linksTitulo: "Links",
    mapaTexto: "Abrir mapa",
    mapaLinkUrl: "",
    mapaEmbedUrl: "",
    footerTexto: "Web propia con reserva online y contacto directo.",
    footerLegalTexto: "Atencion profesional con agenda online.",
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
  const domainSnapshot = await db.collection("negocios").where("customDomain", "in", candidates).limit(1).get();
  let doc = domainSnapshot.docs[0];

  if (!doc) {
    const hostParts = normalizedHost.split(".");
    const slugBase = hostParts.length > 2 ? hostParts.slice(0, -2).join("-") : hostParts[0];
    const slugCandidate = normalizeSlug(slugBase);
    if (slugCandidate) {
      const slugSnapshot = await db.collection("negocios").where("slug", "==", slugCandidate).limit(1).get();
      doc = slugSnapshot.docs[0];
    }
  }

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
      activo: data.activo !== false,
      sucursalIds: Array.isArray(data.sucursalIds) ? data.sucursalIds.map(String) : []
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
    ctaSecundarioTexto: readText(data, "ctaSecundarioTexto", defaults),
    landingSubtituloMarca: readText(data, "landingSubtituloMarca", defaults),
    navServiciosTexto: readText(data, "navServiciosTexto", defaults),
    navBeneficiosTexto: readText(data, "navBeneficiosTexto", defaults),
    navPaquetesTexto: readText(data, "navPaquetesTexto", defaults),
    navContactoTexto: readText(data, "navContactoTexto", defaults),
    heroCardEtiqueta: readText(data, "heroCardEtiqueta", defaults),
    heroCardTitulo: readText(data, "heroCardTitulo", defaults),
    heroCardTexto: readText(data, "heroCardTexto", defaults),
    sobreTitulo: readText(data, "sobreTitulo", defaults),
    sobreTexto: readText(data, "sobreTexto", defaults),
    serviciosEtiqueta: readText(data, "serviciosEtiqueta", defaults),
    queHacemosTitulo: readText(data, "queHacemosTitulo", defaults),
    queHacemosTexto: readText(data, "queHacemosTexto", defaults),
    beneficiosEtiqueta: readText(data, "beneficiosEtiqueta", defaults),
    beneficiosTitulo: readText(data, "beneficiosTitulo", defaults),
    beneficioDetalleTexto: readText(data, "beneficioDetalleTexto", defaults),
    beneficio1Titulo: readText(data, "beneficio1Titulo", defaults),
    beneficio1Texto: readText(data, "beneficio1Texto", defaults),
    beneficio2Titulo: readText(data, "beneficio2Titulo", defaults),
    beneficio2Texto: readText(data, "beneficio2Texto", defaults),
    beneficio3Titulo: readText(data, "beneficio3Titulo", defaults),
    beneficio3Texto: readText(data, "beneficio3Texto", defaults),
    paquetesEtiqueta: readText(data, "paquetesEtiqueta", defaults),
    paquetesTitulo: readText(data, "paquetesTitulo", defaults),
    paquete1Nombre: readText(data, "paquete1Nombre", defaults),
    paquete1Texto: readText(data, "paquete1Texto", defaults),
    paquete1Feature1: readText(data, "paquete1Feature1", defaults),
    paquete1Feature2: readText(data, "paquete1Feature2", defaults),
    paquete1Feature3: readText(data, "paquete1Feature3", defaults),
    paquete2Nombre: readText(data, "paquete2Nombre", defaults),
    paquete2Texto: readText(data, "paquete2Texto", defaults),
    paquete2Feature1: readText(data, "paquete2Feature1", defaults),
    paquete2Feature2: readText(data, "paquete2Feature2", defaults),
    paquete2Feature3: readText(data, "paquete2Feature3", defaults),
    paquete3Nombre: readText(data, "paquete3Nombre", defaults),
    paquete3Texto: readText(data, "paquete3Texto", defaults),
    paquete3Feature1: readText(data, "paquete3Feature1", defaults),
    paquete3Feature2: readText(data, "paquete3Feature2", defaults),
    paquete3Feature3: readText(data, "paquete3Feature3", defaults),
    menuEtiqueta: readText(data, "menuEtiqueta", defaults),
    menuTitulo: readText(data, "menuTitulo", defaults),
    experiencia1Titulo: readText(data, "experiencia1Titulo", defaults),
    experiencia1Texto: readText(data, "experiencia1Texto", defaults),
    experiencia2Titulo: readText(data, "experiencia2Titulo", defaults),
    experiencia2Texto: readText(data, "experiencia2Texto", defaults),
    experiencia3Titulo: readText(data, "experiencia3Titulo", defaults),
    experiencia3Texto: readText(data, "experiencia3Texto", defaults),
    faqEtiqueta: readText(data, "faqEtiqueta", defaults),
    faqTitulo: readText(data, "faqTitulo", defaults),
    faq1Pregunta: readText(data, "faq1Pregunta", defaults),
    faq1Respuesta: readText(data, "faq1Respuesta", defaults),
    faq2Pregunta: readText(data, "faq2Pregunta", defaults),
    faq2Respuesta: readText(data, "faq2Respuesta", defaults),
    faq3Pregunta: readText(data, "faq3Pregunta", defaults),
    faq3Respuesta: readText(data, "faq3Respuesta", defaults),
    finalCtaEtiqueta: readText(data, "finalCtaEtiqueta", defaults),
    finalCtaTitulo: readText(data, "finalCtaTitulo", defaults),
    finalCtaTexto: readText(data, "finalCtaTexto", defaults),
    heroImageUrl: typeof data?.heroImageUrl === "string" ? data.heroImageUrl.trim() : "",
    galeriaImageUrl1: typeof data?.galeriaImageUrl1 === "string" ? data.galeriaImageUrl1.trim() : defaults.galeriaImageUrl1,
    galeriaImageUrl2: typeof data?.galeriaImageUrl2 === "string" ? data.galeriaImageUrl2.trim() : defaults.galeriaImageUrl2,
    seccion5ImageUrl: typeof data?.seccion5ImageUrl === "string" ? data.seccion5ImageUrl.trim() : defaults.seccion5ImageUrl,
    direccion: readText(data, "direccion", defaults),
    zonaAtencion: readText(data, "zonaAtencion", defaults),
    contactoTitulo: readText(data, "contactoTitulo", defaults),
    linksTitulo: readText(data, "linksTitulo", defaults),
    mapaTexto: readText(data, "mapaTexto", defaults),
    mapaLinkUrl: typeof data?.mapaLinkUrl === "string" ? data.mapaLinkUrl.trim() : "",
    mapaEmbedUrl: typeof data?.mapaEmbedUrl === "string" ? data.mapaEmbedUrl.trim() : "",
    footerTexto: readText(data, "footerTexto", defaults),
    footerLegalTexto: readText(data, "footerLegalTexto", defaults),
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
