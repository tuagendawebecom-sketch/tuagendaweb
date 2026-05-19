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

export type PublicService = {
  id: string;
  nombre: string;
  duracionMin: number;
  precio?: number;
  activo: boolean;
};

export type LeadInterestPlan = BusinessPlan | "not_sure";
