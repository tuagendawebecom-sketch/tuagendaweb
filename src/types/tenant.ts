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
  sobreTitulo: string;
  sobreTexto: string;
  beneficiosTitulo: string;
  beneficio1Titulo: string;
  beneficio1Texto: string;
  beneficio2Titulo: string;
  beneficio2Texto: string;
  beneficio3Titulo: string;
  beneficio3Texto: string;
  finalCtaTitulo: string;
  finalCtaTexto: string;
  heroImageUrl: string;
  mapaLinkUrl: string;
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
