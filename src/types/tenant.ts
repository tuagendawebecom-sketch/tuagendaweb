export type BusinessPlan = "agenda_simple" | "agenda_pro" | "web_completa";

export type BusinessStatus = "trial" | "active" | "past_due" | "suspended" | "cancelled";

export type BillingStatus = "manual_active" | "manual_pending" | "manual_past_due" | "manual_suspended";

export type BusinessUserRole = "superadmin" | "owner" | "staff" | "viewer";

export type PublicBusiness = {
  id: string;
  nombre: string;
  slug: string;
  plan: BusinessPlan;
  estado: BusinessStatus;
  activo: boolean;
  billingStatus: BillingStatus;
  ownerNombre?: string;
  ownerTelefono?: string;
  ownerEmail?: string;
  logoUrl?: string;
  initials?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  whatsapp?: string;
  instagram?: string;
  rubro?: string;
  customDomain?: string;
  monthlyPrice?: number;
  nextPaymentDue?: string;
};

export type PublicWebContent = {
  heroEtiqueta: string;
  heroTitulo: string;
  heroSubtitulo: string;
  ctaPrincipalTexto: string;
  ctaSecundarioTexto: string;
  landingSubtituloMarca: string;
  navServiciosTexto: string;
  navBeneficiosTexto: string;
  navPaquetesTexto: string;
  navContactoTexto: string;
  heroCardEtiqueta: string;
  heroCardTitulo: string;
  heroCardTexto: string;
  sobreTitulo: string;
  sobreTexto: string;
  serviciosEtiqueta: string;
  queHacemosTitulo: string;
  queHacemosTexto: string;
  beneficiosEtiqueta: string;
  beneficiosTitulo: string;
  beneficioDetalleTexto: string;
  beneficio1Titulo: string;
  beneficio1Texto: string;
  beneficio2Titulo: string;
  beneficio2Texto: string;
  beneficio3Titulo: string;
  beneficio3Texto: string;
  paquetesEtiqueta: string;
  paquetesTitulo: string;
  paquete1Nombre: string;
  paquete1Texto: string;
  paquete1Feature1: string;
  paquete1Feature2: string;
  paquete1Feature3: string;
  paquete2Nombre: string;
  paquete2Texto: string;
  paquete2Feature1: string;
  paquete2Feature2: string;
  paquete2Feature3: string;
  paquete3Nombre: string;
  paquete3Texto: string;
  paquete3Feature1: string;
  paquete3Feature2: string;
  paquete3Feature3: string;
  menuEtiqueta: string;
  menuTitulo: string;
  experiencia1Titulo: string;
  experiencia1Texto: string;
  experiencia2Titulo: string;
  experiencia2Texto: string;
  experiencia3Titulo: string;
  experiencia3Texto: string;
  faqEtiqueta: string;
  faqTitulo: string;
  faq1Pregunta: string;
  faq1Respuesta: string;
  faq2Pregunta: string;
  faq2Respuesta: string;
  faq3Pregunta: string;
  faq3Respuesta: string;
  finalCtaEtiqueta: string;
  finalCtaTitulo: string;
  finalCtaTexto: string;
  heroImageUrl: string;
  galeriaImageUrl1: string;
  galeriaImageUrl2: string;
  seccion5ImageUrl: string;
  direccion: string;
  zonaAtencion: string;
  contactoTitulo: string;
  linksTitulo: string;
  mapaTexto: string;
  mapaLinkUrl: string;
  mapaEmbedUrl: string;
  footerTexto: string;
  footerLegalTexto: string;
  facebook: string;
};

export type PublicService = {
  id: string;
  nombre: string;
  duracionMin: number;
  precio?: number;
  activo: boolean;
  personalIds?: string[];
  sucursalIds?: string[];
};

export type PublicStaff = {
  id: string;
  nombre: string;
  especialidad?: string;
  activo: boolean;
};

export type PublicBranch = {
  id: string;
  nombre: string;
  direccion?: string;
  activo: boolean;
};

export type PublicScheduleConfig = {
  diasAtencion: string[];
  horarioInicio: string;
  horarioFin: string;
  intervaloMin: number;
  diasReservaMax: number;
  anticipacionHoras: number;
  horariosPorDia?: Record<string, {
    activo: boolean;
    rangos: Array<{ inicio: string; fin: string }>;
  }>;
};

export type LeadInterestPlan = BusinessPlan | "not_sure";

export type LeadStatus = "new" | "contacted" | "won" | "lost";
