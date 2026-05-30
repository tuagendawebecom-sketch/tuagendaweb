"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { Archive, Copy, Download, ExternalLink, Loader2, MessageCircle, PauseCircle, PlayCircle, PlusCircle, Search, ShieldAlert, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { siteUrl } from "@/data/site";
import { getClientAuth, getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { normalizePhone } from "@/lib/phone";
import { isValidSlug, normalizeSlug } from "@/lib/slug";
import type { BillingStatus, BusinessPlan, BusinessStatus } from "@/types/tenant";

type AdminBusiness = {
  id: string;
  nombre: string;
  slug: string;
  plan: BusinessPlan;
  estado: BusinessStatus;
  activo: boolean;
  billingStatus: BillingStatus;
  rubro?: string;
  ownerNombre?: string;
  ownerTelefono?: string;
  ownerEmail?: string;
  whatsapp?: string;
  customDomain?: string;
  monthlyPrice?: number;
  signupDate?: string;
  billingStartDate?: string;
  nextPaymentDue?: string;
  lastPaymentAt?: { toDate?: () => Date } | string | null;
  createdAt?: { toDate?: () => Date };
  archived?: boolean;
};

type Lead = {
  id: string;
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  interestedPlan?: string;
  message?: string;
  source?: string;
  path?: string;
  utmSource?: string;
  utmCampaign?: string;
  status?: string;
  priority?: string;
  internalNote?: string;
  createdAt?: { toDate?: () => Date };
};

const planLabels: Record<BusinessPlan, string> = {
  agenda_simple: "Agenda Full",
  agenda_pro: "Agenda Full interno",
  web_completa: "Web Completa"
};

const businessPlanOptions: Array<{ value: BusinessPlan; label: string }> = [
  { value: "agenda_simple", label: "Agenda Full" },
  { value: "web_completa", label: "Web Completa" }
];

const leadPlanLabels: Record<string, string> = {
  agenda_simple: "Agenda Full",
  agenda_pro: "Agenda Full",
  web_completa: "Web Completa",
  not_sure: "No sabe todavia"
};

const statusLabels: Record<BusinessStatus, string> = {
  trial: "Trial",
  active: "Activo",
  past_due: "Pago pendiente",
  suspended: "Suspendido",
  cancelled: "Cancelado"
};

const leadStatusLabels: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  follow_up: "Seguimiento",
  meeting_scheduled: "Reunion agendada",
  won: "Ganado",
  lost: "Perdido"
};

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "Sin precio";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);
}

function dateKeyInArgentina(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function addMonths(dateKey: string, months: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function formatDateKey(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(`${value}T12:00:00.000Z`);
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function daysUntil(value?: string) {
  if (!value) return null;
  const today = new Date(`${dateKeyInArgentina()}T12:00:00.000Z`).getTime();
  const target = new Date(`${value}T12:00:00.000Z`).getTime();
  return Math.round((target - today) / 86_400_000);
}

function paymentBadgeClass(days: number | null) {
  if (days === null) return "bg-cream text-ink/60";
  if (days < 0) return "bg-red-50 text-red-700";
  if (days <= 5) return "bg-gold/30 text-teal";
  return "bg-mint text-teal";
}

function formatLeadDate(value?: Lead["createdAt"]) {
  const date = value?.toDate?.();
  if (!date) return "";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatLeadAge(value?: Lead["createdAt"]) {
  const date = value?.toDate?.();
  if (!date) return "Sin fecha";
  const diffHours = Math.max(0, Math.round((Date.now() - date.getTime()) / 36e5));
  if (diffHours < 24) return `Hace ${diffHours || 1} h`;
  return `Hace ${Math.round(diffHours / 24)} d`;
}

function formatLastPayment(value: AdminBusiness["lastPaymentAt"]) {
  if (!value) return "Sin pagos registrados";
  if (typeof value === "string") return formatDateKey(value);
  const date = value.toDate?.();
  if (!date) return "Sin pagos registrados";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function normalizeCustomDomainInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<unknown>>) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function isValidPhoneIfPresent(value: string) {
  return !value || normalizePhone(value).length >= 10;
}

function toBusiness(id: string, data: Record<string, unknown>): AdminBusiness {
  return {
    id,
    nombre: String(data.nombre ?? "Negocio"),
    slug: String(data.slug ?? ""),
    plan: (data.plan ?? "agenda_simple") as BusinessPlan,
    estado: (data.estado ?? "trial") as BusinessStatus,
    activo: data.activo !== false,
    billingStatus: (data.billingStatus ?? "manual_pending") as BillingStatus,
    rubro: data.rubro ? String(data.rubro) : undefined,
    ownerNombre: data.ownerNombre ? String(data.ownerNombre) : undefined,
    ownerTelefono: data.ownerTelefono ? String(data.ownerTelefono) : undefined,
    ownerEmail: data.ownerEmail ? String(data.ownerEmail) : undefined,
    whatsapp: data.whatsapp ? String(data.whatsapp) : undefined,
    customDomain: data.customDomain ? String(data.customDomain) : undefined,
    monthlyPrice: typeof data.monthlyPrice === "number" ? data.monthlyPrice : undefined,
    signupDate: data.signupDate ? String(data.signupDate) : undefined,
    billingStartDate: data.billingStartDate ? String(data.billingStartDate) : undefined,
    nextPaymentDue: data.nextPaymentDue ? String(data.nextPaymentDue) : undefined,
    lastPaymentAt: data.lastPaymentAt as AdminBusiness["lastPaymentAt"],
    createdAt: data.createdAt as AdminBusiness["createdAt"],
    archived: data.archived === true
  };
}

export function SuperAdminDashboard() {
  const [authReady, setAuthReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [businessFilter, setBusinessFilter] = useState("");
  const [businessPlanFilter, setBusinessPlanFilter] = useState("all");
  const [businessStatusFilter, setBusinessStatusFilter] = useState("all");
  const [leadFilter, setLeadFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");
  const [leadDraft, setLeadDraft] = useState<Lead | null>(null);
  const [formKey, setFormKey] = useState(0);
  const db = useMemo(() => getClientDb(), []);
  const auth = useMemo(() => getClientAuth(), []);

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !auth || !db) {
      setAuthReady(true);
      setAllowed(false);
      return;
    }

    return onAuthStateChanged(auth, async (user) => {
      setError("");
      if (!user) {
        setAllowed(false);
        setAuthReady(true);
        return;
      }

      const userSnapshot = await getDoc(doc(db, "businessUsers", user.uid));
      const userData = userSnapshot.data();
      setAllowed(userData?.role === "superadmin" && userData?.isActive === true);
      setAuthReady(true);
    });
  }, [auth, db]);

  useEffect(() => {
    if (!allowed || !db) return;

    const unsubscribeBusinesses = onSnapshot(query(collection(db, "negocios"), orderBy("createdAt", "desc"), limit(100)), (snapshot) => {
      setBusinesses(snapshot.docs.map((item) => toBusiness(item.id, item.data())));
    });

    const unsubscribeLeads = onSnapshot(query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(20)), (snapshot) => {
      setLeads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    return () => {
      unsubscribeBusinesses();
      unsubscribeLeads();
    };
  }, [allowed, db]);

  async function handleCreateBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.currentUser) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") ?? "").trim();
    const slug = normalizeSlug(String(formData.get("slug") || nombre));
    const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
    const initialPassword = String(formData.get("initialPassword") ?? "");
    const ownerTelefono = String(formData.get("ownerTelefono") ?? "").trim();
    const whatsapp = String(formData.get("whatsapp") ?? "").trim();
    const plan = String(formData.get("plan") ?? "agenda_simple") as BusinessPlan;
    const customDomain = String(formData.get("customDomain") ?? "").trim();

    setError("");
    setMessage("");

    if (!nombre || !isValidSlug(slug)) {
      setError("Revisá el nombre y el slug. El slug no puede usar palabras reservadas.");
      return;
    }

    if (!ownerEmail || initialPassword.length < 8) {
      setError("Cargá email del dueño y una contraseña inicial de al menos 8 caracteres.");
      return;
    }

    if (!isValidPhoneIfPresent(ownerTelefono) || !isValidPhoneIfPresent(whatsapp)) {
      setError("Revisá teléfonos y WhatsApp: deben incluir característica y número.");
      return;
    }

    if (customDomain && plan !== "web_completa") {
      setError("El dominio propio solo se carga para negocios con plan Web Completa.");
      return;
    }

    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/superadmin/negocios/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre,
          slug,
          plan,
          signupDate: String(formData.get("signupDate") ?? ""),
          nextPaymentDue: String(formData.get("nextPaymentDue") ?? ""),
          rubro: String(formData.get("rubro") ?? "").trim(),
          ownerNombre: String(formData.get("ownerNombre") ?? "").trim(),
          ownerEmail,
          initialPassword,
          updateExistingPassword: formData.get("updateExistingPassword") === "on",
          ownerTelefono,
          whatsapp,
          instagram: String(formData.get("instagram") ?? "").trim(),
          logoUrl: String(formData.get("logoUrl") ?? "").trim(),
          customDomain
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        const messages: Record<string, string> = {
          firebase_admin_not_configured: "Faltan variables FIREBASE_ADMIN_* en Vercel o el deploy no las tomó.",
          slug_already_exists: "Ese slug ya existe en un negocio activo. Archivá o cancelá el anterior para liberarlo.",
          invalid_owner_credentials: "Revisá email y contraseña inicial del dueño.",
          invalid_custom_domain: "Revisá el dominio propio. Cargalo sin https://, por ejemplo exoticlenceria.com.ar.",
          custom_domain_requires_web_complete: "El dominio propio solo se usa para Web Completa.",
          custom_domain_already_exists: "Ese dominio propio ya está asignado a otro negocio activo.",
          forbidden: "Tu usuario no tiene permiso de superadmin.",
          owner_lookup_failed: "No se pudo revisar o crear el usuario dueño en Firebase Auth."
        };
        setError(messages[result.error] ?? "No se pudo crear el negocio.");
        return;
      }

      form.reset();
      setLeadDraft(null);
      setFormKey((current) => current + 1);
      setMessage(`Negocio creado: ${siteUrl}/${result.slug}. Dueño: ${result.ownerEmail}. Entregá la contraseña inicial y pedile que la cambie desde el panel.`);
    } catch {
      setError("No se pudo crear el negocio. Revisá variables FIREBASE_ADMIN_* y volvé a desplegar.");
    } finally {
      setSaving(false);
    }
  }

  async function updateBusinessStatus(business: AdminBusiness, estado: BusinessStatus) {
    if (!db) return;
    setError("");
    try {
      await updateDoc(doc(db, "negocios", business.id), {
        estado,
        activo: estado !== "suspended" && estado !== "cancelled",
        billingStatus: estado === "active" || estado === "trial" ? "manual_active" : estado === "past_due" ? "manual_past_due" : "manual_suspended",
        updatedAt: serverTimestamp()
      });
      setMessage(`${business.nombre}: estado actualizado a ${statusLabels[estado]}.`);
    } catch {
      setError("No se pudo actualizar el estado del negocio.");
    }
  }

  async function archiveBusiness(business: AdminBusiness) {
    if (!db) return;
    const confirmed = window.confirm(`¿Archivar ${business.nombre}? Se oculta de la lista operativa y se libera el slug.`);
    if (!confirmed) return;

    setError("");
    try {
      await updateDoc(doc(db, "negocios", business.id), {
        archived: true,
        archivedAt: serverTimestamp(),
        estado: "cancelled",
        activo: false,
        billingStatus: "manual_suspended",
        slug: `${business.slug}-archivado-${Date.now()}`,
        logoUrl: "",
        updatedAt: serverTimestamp()
      });
      setMessage(`${business.nombre} archivado. El slug quedó liberado para otro negocio.`);
    } catch {
      setError("No se pudo archivar el negocio.");
    }
  }

  async function updateLeadStatus(leadId: string, status: string) {
    if (!db) return;
    setError("");
    try {
      await updateDoc(doc(db, "leads", leadId), { status, updatedAt: serverTimestamp() });
      setMessage("Lead actualizado.");
    } catch {
      setError("No se pudo actualizar el lead.");
    }
  }

  async function updateLeadNote(lead: Lead) {
    if (!db) return;
    const nextNote = window.prompt("Nota interna para este lead", lead.internalNote ?? "");
    if (nextNote === null) return;
    setError("");
    try {
      await updateDoc(doc(db, "leads", lead.id), { internalNote: nextNote.trim(), updatedAt: serverTimestamp() });
      setMessage("Nota interna guardada.");
    } catch {
      setError("No se pudo guardar la nota interna.");
    }
  }

  function fillLeadAsBusinessDraft(lead: Lead) {
    setLeadDraft(lead);
    setFormKey((current) => current + 1);
    setMessage(`Datos de ${lead.businessName ?? "lead"} cargados en el formulario de negocio.`);
    window.setTimeout(() => document.getElementById("crear-negocio")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function copyPublicLink(slug: string) {
    try {
      await navigator.clipboard?.writeText(`${siteUrl}/${slug}`);
      setCopiedSlug(slug);
      window.setTimeout(() => setCopiedSlug(""), 1600);
    } catch {
      setError("No se pudo copiar el link. Copialo manualmente desde la tarjeta.");
    }
  }

  function exportLeadsCsv() {
    const headers = ["nombre", "telefono", "negocio", "rubro", "plan", "estado", "mensaje", "origen", "campana", "nota", "fecha"];
    const rows = filteredLeads.map((lead) => [lead.name, lead.phone, lead.businessName, lead.businessType, lead.interestedPlan, lead.status ?? "new", lead.message ?? "", lead.source ?? "", lead.utmCampaign ?? "", lead.internalNote ?? "", formatLeadDate(lead.createdAt)]);
    downloadCsv(`tuagendaweb-leads-${dateKeyInArgentina()}.csv`, [headers, ...rows]);
  }

  async function updateBusinessBillingDate(business: AdminBusiness, field: "signupDate" | "nextPaymentDue", value: string) {
    if (!db || !value) return;
    setError("");
    try {
      await updateDoc(doc(db, "negocios", business.id), {
        [field]: value,
        ...(field === "signupDate" ? { billingStartDate: value } : {}),
        updatedAt: serverTimestamp()
      });
      setMessage(`${business.nombre}: fecha actualizada.`);
    } catch {
      setError("No se pudo actualizar la fecha del negocio.");
    }
  }

  async function updateBusinessCustomDomain(business: AdminBusiness, value: string) {
    if (!db) return;
    const customDomain = normalizeCustomDomainInput(value);
    if (customDomain && !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(customDomain)) {
      setError("Revisá el dominio propio. Usá un formato como exoticlenceria.com.ar.");
      return;
    }

    setError("");
    try {
      await updateDoc(doc(db, "negocios", business.id), {
        customDomain,
        updatedAt: serverTimestamp()
      });
      setMessage(customDomain ? `${business.nombre}: dominio propio actualizado.` : `${business.nombre}: dominio propio eliminado.`);
    } catch {
      setError("No se pudo actualizar el dominio propio.");
    }
  }

  async function markBusinessPaid(business: AdminBusiness) {
    if (!db) return;
    const baseDate = business.nextPaymentDue && daysUntil(business.nextPaymentDue) !== null && (daysUntil(business.nextPaymentDue) ?? 0) > -45 ? business.nextPaymentDue : dateKeyInArgentina();
    const nextPaymentDue = addMonths(baseDate, 1);
    setError("");
    try {
      await updateDoc(doc(db, "negocios", business.id), {
        estado: "active",
        activo: true,
        billingStatus: "manual_active",
        lastPaymentAt: serverTimestamp(),
        nextPaymentDue,
        updatedAt: serverTimestamp()
      });
      setMessage(`${business.nombre}: pago registrado. Proximo cobro ${formatDateKey(nextPaymentDue)}.`);
    } catch {
      setError("No se pudo registrar el pago.");
    }
  }

  function exportBusinessesCsv() {
    const headers = ["negocio", "slug", "link", "dominio_propio", "reservas_dominio", "plan", "estado", "dueno", "email", "telefono", "whatsapp", "mensual"];
    const rows = filteredBusinesses.map((business) => [
      business.nombre,
      business.slug,
      `${siteUrl}/${business.slug}`,
      business.customDomain ?? "",
      business.customDomain ? `https://${business.customDomain}/reservar` : "",
      planLabels[business.plan],
      statusLabels[business.estado],
      business.ownerNombre ?? "",
      business.ownerEmail ?? "",
      business.ownerTelefono ?? "",
      business.whatsapp ?? "",
      business.monthlyPrice ?? 0
    ]);
    downloadCsv(`tuagendaweb-negocios-${dateKeyInArgentina()}.csv`, [headers, ...rows]);
  }

  async function copyClientAccessMessage(business: AdminBusiness) {
    const text = `Hola ${business.ownerNombre ?? ""}, ya tenes tu acceso a TuAgendaWeb.\n\nPanel: ${siteUrl}/login\nAgenda: ${siteUrl}/${business.slug}\nEmail: ${business.ownerEmail ?? "tu email"}\n\nIngresas con la contrasena inicial que te pase y despues podes cambiarla desde el panel.`;
    try {
      await navigator.clipboard?.writeText(text);
      setMessage("Mensaje de acceso copiado.");
    } catch {
      setError("No se pudo copiar el mensaje de acceso.");
    }
  }

  async function copyPaymentReminder(business: AdminBusiness) {
    if (!business.nextPaymentDue) {
      setError("Este negocio no tiene próximo cobro cargado.");
      return;
    }
    const text = `Hola ${business.ownerNombre ?? ""}, te escribo por TuAgendaWeb para ${business.nombre}.\n\nImporte mensual: ${formatCurrency(business.monthlyPrice)}\nVencimiento: ${formatDateKey(business.nextPaymentDue)}\nAgenda: ${siteUrl}/${business.slug}\n\nCuando regularices el pago, te dejo la agenda activa.`;
    try {
      await navigator.clipboard?.writeText(text);
      setMessage("Recordatorio de pago copiado.");
    } catch {
      setError("No se pudo copiar el recordatorio.");
    }
  }

  async function copyOwnerEmail(email?: string) {
    if (!email) {
      setError("Este negocio no tiene email de dueno cargado.");
      return;
    }
    try {
      await navigator.clipboard?.writeText(email);
      setMessage("Email del dueno copiado.");
    } catch {
      setError("No se pudo copiar el email.");
    }
  }

  const visibleBusinesses = businesses.filter((business) => !business.archived);
  const filteredBusinesses = visibleBusinesses.filter((business) => {
    const value = businessFilter.toLowerCase().trim();
    if (businessPlanFilter !== "all" && business.plan !== businessPlanFilter) return false;
    if (businessStatusFilter !== "all" && business.estado !== businessStatusFilter) return false;
    if (!value) return true;
    return [business.nombre, business.slug, business.rubro, business.ownerNombre, business.ownerEmail, business.whatsapp, business.customDomain, business.nextPaymentDue, business.signupDate]
      .filter(Boolean)
      .some((item) => item?.toLowerCase().includes(value));
  });
  const filteredLeads = leads.filter((lead) => {
    if (leadFilter !== "all" && (lead.status ?? "new") !== leadFilter) return false;
    const value = leadSearch.toLowerCase().trim();
    if (!value) return true;
    return [lead.name, lead.phone, lead.businessName, lead.businessType, lead.interestedPlan, lead.message, lead.utmCampaign, lead.source]
      .filter(Boolean)
      .some((item) => String(item).toLowerCase().includes(value));
  });
  const activeBusinesses = visibleBusinesses.filter((business) => business.estado === "active" || business.estado === "trial").length;
  const suspendedBusinesses = visibleBusinesses.filter((business) => business.estado === "suspended" || business.estado === "cancelled").length;
  const newLeads = leads.filter((lead) => (lead.status ?? "new") === "new").length;
  const contactedLeads = leads.filter((lead) => (lead.status ?? "new") === "contacted").length;
  const wonLeads = leads.filter((lead) => (lead.status ?? "new") === "won").length;
  const followUpLeads = leads.filter((lead) => (lead.status ?? "new") === "follow_up").length;
  const businessesWithoutOwner = visibleBusinesses.filter((business) => !business.ownerEmail).length;
  const pastDueBusinesses = visibleBusinesses.filter((business) => business.estado === "past_due").length;
  const overdueBusinesses = visibleBusinesses.filter((business) => {
    const days = daysUntil(business.nextPaymentDue);
    return business.estado !== "cancelled" && days !== null && days < 0;
  }).length;
  const dueSoonBusinesses = visibleBusinesses.filter((business) => {
    const days = daysUntil(business.nextPaymentDue);
    return business.estado !== "cancelled" && days !== null && days >= 0 && days <= 5;
  }).length;
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => (a.nextPaymentDue ?? "9999-12-31").localeCompare(b.nextPaymentDue ?? "9999-12-31"));
  const estimatedMonthlyRevenue = visibleBusinesses
    .filter((business) => business.estado === "active" || business.estado === "trial")
    .reduce((total, business) => total + (business.monthlyPrice ?? 0), 0);

  if (!authReady) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 text-center shadow-soft">
        <Loader2 className="mx-auto animate-spin text-action" />
        <p className="mt-4 font-bold text-teal">Verificando acceso...</p>
      </div>
    );
  }

  if (!isFirebaseClientConfigured()) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <ShieldAlert className="text-action" size={30} />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-teal">Firebase no está configurado</h2>
        <p className="mt-2 leading-7 text-ink/65">Cargá las variables NEXT_PUBLIC_FIREBASE_* en Vercel y en .env.local para usar este panel.</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <ShieldAlert className="text-action" size={30} />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-teal">Acceso restringido</h2>
        <p className="mt-2 leading-7 text-ink/65">Ingresá en /login con un usuario que tenga role superadmin e isActive true en businessUsers.</p>
        <Link className="mt-5 inline-flex rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" href="/login">
          Ir al login
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-[2rem] bg-ink p-6 text-cream shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gold">Operativo</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">Super Admin TuAgendaWeb</h1>
        </div>
        <button className="rounded-2xl border border-cream/20 px-4 py-3 text-sm font-bold" onClick={() => auth && signOut(auth)} type="button">
          Cerrar sesión
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          ["Negocios activos", activeBusinesses],
          ["Pausados/cancelados", suspendedBusinesses],
          ["Leads nuevos", newLeads],
          ["Seguimientos", followUpLeads],
          ["Vencidos", overdueBusinesses],
          ["Vencen pronto", dueSoonBusinesses],
          ["Sin email owner", businessesWithoutOwner],
          ["Mensual estimado", formatCurrency(estimatedMonthlyRevenue)]
        ].map(([label, value]) => (
          <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft" key={label as string}>
            <p className="text-sm font-bold text-ink/55">{label as string}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-teal sm:text-4xl">{value as number | string}</p>
          </div>
        ))}
      </div>
      {pastDueBusinesses ? <p className="rounded-2xl bg-gold/20 p-4 text-sm font-bold text-teal">Negocios con pago pendiente: {pastDueBusinesses}</p> : null}

      <form className="grid scroll-mt-24 gap-4 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft lg:grid-cols-4" id="crear-negocio" key={formKey} onSubmit={handleCreateBusiness}>
        <div className="lg:col-span-4">
          <h2 className="font-display text-2xl font-extrabold text-teal">Crear negocio y acceso del cliente</h2>
          <p className="mt-2 text-sm font-semibold text-ink/60">Elegi una contrasena inicial. El cliente puede cambiarla desde su panel cuando ingresa.</p>
          {leadDraft ? <p className="mt-3 rounded-2xl bg-mint p-3 text-sm font-bold text-teal">Formulario precargado desde lead: {leadDraft.businessName ?? leadDraft.name}</p> : null}
          {leadDraft ? <button className="mt-3 rounded-full bg-cream px-4 py-2 text-xs font-extrabold text-teal ring-1 ring-ink/10" onClick={() => { setLeadDraft(null); setFormKey((current) => current + 1); }} type="button">Limpiar lead precargado</button> : null}
        </div>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Negocio
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={leadDraft?.businessName ?? ""} name="nombre" required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Slug
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="slug" placeholder="nombre-del-negocio" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Rubro
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={leadDraft?.businessType ?? ""} name="rubro" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Plan
          <select className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue="agenda_simple" name="plan">
            {businessPlanOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Dueno
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={leadDraft?.name ?? ""} name="ownerNombre" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Email dueno
          <input autoComplete="email" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="ownerEmail" required type="email" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Contrasena inicial
          <input autoComplete="new-password" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" minLength={8} name="initialPassword" required type="text" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Telefono dueno
          <input autoComplete="tel-national" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={leadDraft?.phone ?? ""} inputMode="tel" maxLength={30} name="ownerTelefono" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          WhatsApp visible
          <input autoComplete="tel-national" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={leadDraft?.phone ?? ""} inputMode="tel" maxLength={30} name="whatsapp" placeholder="549381..." />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Instagram
          <input autoComplete="url" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="instagram" placeholder="https://instagram.com/..." type="url" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Logo URL
          <input autoComplete="url" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="logoUrl" placeholder="Opcional" type="url" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Dominio propio
          <input autoCapitalize="none" autoComplete="off" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="customDomain" placeholder="exoticlenceria.com.ar" />
          <span className="text-xs font-semibold text-ink/50">Solo para Web Completa. Sin https:// ni barra final.</span>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Fecha de alta
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={dateKeyInArgentina()} name="signupDate" type="date" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Proximo cobro
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="nextPaymentDue" type="date" />
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-teal lg:col-span-2">
          <input name="updateExistingPassword" type="checkbox" />
          Si el email ya existe, actualizar su contrasena inicial
        </label>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream transition hover:bg-action disabled:cursor-wait disabled:opacity-70 lg:col-span-4" disabled={saving} type="submit">
          <PlusCircle size={18} />
          {saving ? "Creando..." : "Crear negocio y usuario"}
        </button>
        <div aria-live="polite" className="lg:col-span-4">
          {message ? <p className="rounded-2xl bg-mint p-4 text-sm font-bold text-teal">{message}</p> : null}
          {error ? <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
        </div>
      </form>

      <section className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-2xl font-extrabold text-teal">Negocios</h2>
          <div className="grid w-full gap-2 sm:max-w-4xl sm:grid-cols-[1fr_auto_auto_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
              <input aria-label="Buscar negocios" className="w-full rounded-2xl border border-ink/10 bg-paper py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-action" onChange={(event) => setBusinessFilter(event.target.value)} placeholder="Buscar negocio, slug o dueño" value={businessFilter} />
            </label>
            <select aria-label="Filtrar negocios por plan" className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-teal outline-none" onChange={(event) => setBusinessPlanFilter(event.target.value)} value={businessPlanFilter}>
              <option value="all">Todos los planes</option>
              {businessPlanOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select aria-label="Filtrar negocios por estado" className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-teal outline-none" onChange={(event) => setBusinessStatusFilter(event.target.value)} value={businessStatusFilter}>
              <option value="all">Todos los estados</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button className="rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream" onClick={exportBusinessesCsv} type="button">
              CSV
            </button>
          </div>
        </div>
        {filteredBusinesses.length === 0 ? <p className="rounded-2xl bg-paper p-5 font-semibold text-ink/60">No hay negocios para ese filtro.</p> : null}
        {sortedBusinesses.map((business) => {
          const dueDays = daysUntil(business.nextPaymentDue);
          const signupFallback = business.signupDate ?? business.createdAt?.toDate?.().toISOString().slice(0, 10);
          return (
          <article className="grid gap-4 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft lg:grid-cols-[1fr_auto]" key={business.id}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl font-extrabold text-teal">{business.nombre}</h3>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-teal">{planLabels[business.plan]}</span>
                <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-teal">{statusLabels[business.estado]}</span>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink/60">{formatCurrency(business.monthlyPrice)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink/62">{business.rubro ?? "Sin rubro"} · {business.ownerNombre ?? "Sin dueño asignado"}</p>
              <div className="mt-3 grid gap-2 text-sm font-bold text-ink/62 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1 sm:col-span-2">
                  Dominio propio
                  <input
                    className="rounded-xl border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-action"
                    defaultValue={business.customDomain ?? ""}
                    onBlur={(event) => updateBusinessCustomDomain(business, event.target.value)}
                    placeholder="exoticlenceria.com.ar"
                  />
                </label>
                <label className="grid gap-1">
                  Alta
                  <input className="rounded-xl border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-action" defaultValue={signupFallback ?? ""} onBlur={(event) => updateBusinessBillingDate(business, "signupDate", event.target.value)} type="date" />
                </label>
                <label className="grid gap-1">
                  Proximo cobro
                  <input className="rounded-xl border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-action" defaultValue={business.nextPaymentDue ?? ""} onBlur={(event) => updateBusinessBillingDate(business, "nextPaymentDue", event.target.value)} type="date" />
                </label>
                <span className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-extrabold ${paymentBadgeClass(dueDays)}`}>
                  {dueDays === null ? "Sin vencimiento" : dueDays < 0 ? `Vencido hace ${Math.abs(dueDays)} dias` : dueDays === 0 ? "Vence hoy" : `Vence en ${dueDays} dias`}
                </span>
                <span className="inline-flex items-center rounded-xl bg-cream px-3 py-2 text-xs font-bold text-ink/55">Ultimo pago: {formatLastPayment(business.lastPaymentAt)}</span>
              </div>
              <Link className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-action" href={`/${business.slug}`} rel="noopener noreferrer" target="_blank">
                {siteUrl}/{business.slug} <ExternalLink size={16} />
              </Link>
              {business.customDomain ? (
                <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold">
                  <Link className="inline-flex items-center gap-2 text-teal" href={`https://${business.customDomain}`} rel="noopener noreferrer" target="_blank">
                    Web: {business.customDomain} <ExternalLink size={16} />
                  </Link>
                  <Link className="inline-flex items-center gap-2 text-teal" href={`https://${business.customDomain}/reservar`} rel="noopener noreferrer" target="_blank">
                    Reservas: /reservar <ExternalLink size={16} />
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-teal" onClick={() => copyPublicLink(business.slug)} type="button">
                <Copy size={16} /> {copiedSlug === business.slug ? "Copiado" : "Copiar"}
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-sm font-bold text-teal ring-1 ring-ink/10" onClick={() => copyClientAccessMessage(business)} type="button">
                Acceso
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-sm font-bold text-teal ring-1 ring-ink/10" onClick={() => copyOwnerEmail(business.ownerEmail)} type="button">
                Email
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-sm font-bold text-teal ring-1 ring-ink/10" onClick={() => copyPaymentReminder(business)} type="button">
                Cobro
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-teal disabled:opacity-50" disabled={!business.nextPaymentDue} onClick={() => markBusinessPaid(business)} type="button">
                Pago recibido
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-teal" onClick={() => updateBusinessStatus(business, "trial")} type="button">
                Trial
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream" onClick={() => updateBusinessStatus(business, "active")} type="button">
                <PlayCircle size={16} /> Activar
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-sm font-bold text-teal ring-1 ring-ink/10" onClick={() => updateBusinessStatus(business, "past_due")} type="button">
                Pago pendiente
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-teal" onClick={() => updateBusinessStatus(business, "suspended")} type="button">
                <PauseCircle size={16} /> Suspender
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" onClick={() => updateBusinessStatus(business, "cancelled")} type="button">
                <XCircle size={16} /> Cancelar
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-cream" onClick={() => archiveBusiness(business)} type="button">
                <Archive size={16} /> Archivar
              </button>
            </div>
          </article>
          );
        })}
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-2xl font-extrabold text-teal">Últimos leads</h2>
          <div className="grid w-full gap-2 sm:max-w-3xl sm:grid-cols-[1fr_auto_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
              <input aria-label="Buscar leads" className="w-full rounded-2xl border border-ink/10 bg-paper py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-action" onChange={(event) => setLeadSearch(event.target.value)} placeholder="Buscar lead, teléfono o rubro" value={leadSearch} />
            </label>
            <select aria-label="Filtrar leads por estado" className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm font-bold text-teal outline-none" onChange={(event) => setLeadFilter(event.target.value)} value={leadFilter}>
              <option value="all">Todos</option>
              <option value="new">Nuevos</option>
              <option value="contacted">Contactados</option>
              <option value="follow_up">Seguimiento</option>
              <option value="meeting_scheduled">Reunión agendada</option>
              <option value="won">Ganados</option>
              <option value="lost">Perdidos</option>
            </select>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream" onClick={exportLeadsCsv} type="button">
              <Download size={16} /> Exportar CSV
            </button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <p className="rounded-2xl bg-paper p-4 text-sm font-bold text-ink/65">Nuevos: {newLeads}</p>
          <p className="rounded-2xl bg-paper p-4 text-sm font-bold text-ink/65">Contactados: {contactedLeads}</p>
          <p className="rounded-2xl bg-paper p-4 text-sm font-bold text-ink/65">Seguimiento: {followUpLeads}</p>
          <p className="rounded-2xl bg-paper p-4 text-sm font-bold text-ink/65">Ganados: {wonLeads}</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredLeads.length === 0 ? <p className="rounded-2xl bg-paper p-5 font-semibold text-ink/60 lg:col-span-2">No hay leads para ese filtro.</p> : null}
          {filteredLeads.map((lead) => (
            <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-5" key={lead.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-display text-xl font-extrabold text-teal">{lead.businessName ?? "Negocio"}</p>
                <div className="flex flex-wrap gap-2">
                  {lead.priority ? <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-teal">{lead.priority}</span> : null}
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-teal">{leadStatusLabels[lead.status ?? "new"] ?? "Nuevo"}</span>
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink/55">{formatLeadAge(lead.createdAt)}</span>
                </div>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink/62">{lead.name} · {lead.phone}</p>
              <p className="mt-2 text-sm text-ink/62">{lead.businessType} - {leadPlanLabels[lead.interestedPlan ?? ""] ?? lead.interestedPlan}</p>
              {lead.message ? <p className="mt-3 rounded-2xl bg-cream p-3 text-sm leading-6 text-ink/70">{lead.message}</p> : null}
              {lead.internalNote ? <p className="mt-3 rounded-2xl bg-mint p-3 text-sm font-semibold leading-6 text-teal">Nota interna: {lead.internalNote}</p> : null}
              <p className="mt-3 text-xs font-semibold text-ink/45">
                {[formatLeadDate(lead.createdAt), lead.source, lead.utmCampaign ? `campana: ${lead.utmCampaign}` : "", lead.path].filter(Boolean).join(" | ")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {lead.phone && normalizePhone(String(lead.phone)).length >= 10 ? (
                  <Link className="inline-flex items-center gap-2 rounded-xl bg-teal px-3 py-2 text-xs font-bold text-cream" href={`https://wa.me/${normalizePhone(String(lead.phone))}?text=${encodeURIComponent(`Hola ${lead.name ?? ""}, vi tu consulta por TuAgendaWeb para ${lead.businessName ?? "tu negocio"}. Te escribo para ayudarte a elegir el plan.`)}`} rel="noopener noreferrer" target="_blank">
                    <MessageCircle size={14} /> WhatsApp
                  </Link>
                ) : null}
                <button className="rounded-xl bg-mint px-3 py-2 text-xs font-bold text-teal" onClick={() => updateLeadStatus(lead.id, "contacted")} type="button">Contactado</button>
                <button className="rounded-xl bg-cream px-3 py-2 text-xs font-bold text-teal ring-1 ring-ink/10" onClick={() => updateLeadStatus(lead.id, "follow_up")} type="button">Seguimiento</button>
                <button className="rounded-xl bg-cream px-3 py-2 text-xs font-bold text-teal ring-1 ring-ink/10" onClick={() => updateLeadStatus(lead.id, "meeting_scheduled")} type="button">Reunion</button>
                <button className="rounded-xl bg-cream px-3 py-2 text-xs font-bold text-teal ring-1 ring-ink/10" onClick={() => fillLeadAsBusinessDraft(lead)} type="button">Crear negocio</button>
                <button className="rounded-xl bg-cream px-3 py-2 text-xs font-bold text-teal ring-1 ring-ink/10" onClick={() => updateLeadNote(lead)} type="button">Nota</button>
                <button className="rounded-xl bg-gold/30 px-3 py-2 text-xs font-bold text-teal" onClick={() => updateLeadStatus(lead.id, "won")} type="button">Ganado</button>
                <button className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700" onClick={() => updateLeadStatus(lead.id, "lost")} type="button">Perdido</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
