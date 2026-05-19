"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { Copy, ExternalLink, Loader2, PauseCircle, PlayCircle, PlusCircle, ShieldAlert, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getClientAuth, getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { isValidSlug, normalizeSlug } from "@/lib/slug";
import { siteUrl } from "@/data/site";
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
  monthlyPrice?: number;
};

type Lead = {
  id: string;
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  interestedPlan?: string;
  status?: string;
};

const planLabels: Record<BusinessPlan, string> = {
  agenda_simple: "Agenda Simple",
  agenda_pro: "Agenda Pro",
  web_completa: "Web Completa"
};

const statusLabels: Record<BusinessStatus, string> = {
  trial: "Trial",
  active: "Activo",
  past_due: "Pago pendiente",
  suspended: "Suspendido",
  cancelled: "Cancelado"
};

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
    monthlyPrice: typeof data.monthlyPrice === "number" ? data.monthlyPrice : undefined
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

    const unsubscribeBusinesses = onSnapshot(query(collection(db, "negocios"), orderBy("createdAt", "desc"), limit(80)), (snapshot) => {
      setBusinesses(snapshot.docs.map((item) => toBusiness(item.id, item.data())));
    });

    const unsubscribeLeads = onSnapshot(query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(20)), (snapshot) => {
      setLeads(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }))
      );
    });

    return () => {
      unsubscribeBusinesses();
      unsubscribeLeads();
    };
  }, [allowed, db]);

  async function handleCreateBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") ?? "").trim();
    const slug = normalizeSlug(String(formData.get("slug") || nombre));
    const plan = String(formData.get("plan") ?? "agenda_simple") as BusinessPlan;
    const monthlyPrice = plan === "agenda_simple" ? 15000 : plan === "agenda_pro" ? 30000 : 0;

    setError("");
    setMessage("");

    if (!nombre || !isValidSlug(slug)) {
      setError("Revisá el nombre y el slug. El slug no puede usar palabras reservadas.");
      return;
    }

    setSaving(true);
    try {
      const duplicate = await getDocs(query(collection(db, "negocios"), where("slug", "==", slug), limit(1)));
      if (!duplicate.empty) {
        setError("Ese slug ya existe. Elegí otro.");
        return;
      }

      const businessRef = await addDoc(collection(db, "negocios"), {
        nombre,
        slug,
        plan,
        estado: "trial",
        activo: true,
        billingStatus: "manual_active",
        rubro: String(formData.get("rubro") ?? "").trim(),
        ownerNombre: String(formData.get("ownerNombre") ?? "").trim(),
        ownerEmail: String(formData.get("ownerEmail") ?? "").trim(),
        ownerTelefono: String(formData.get("ownerTelefono") ?? "").trim(),
        whatsapp: String(formData.get("whatsapp") ?? "").replace(/\D/g, ""),
        initials: nombre
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
        colorPrimario: "#123D3A",
        colorSecundario: "#E7B85A",
        monthlyPrice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "negocios", businessRef.id, "servicios"), {
        nombre: "Servicio inicial",
        duracionMin: 60,
        precio: 0,
        activo: true,
        orden: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      form.reset();
      setMessage(`Negocio creado: ${siteUrl}/agenda/${slug}`);
    } catch {
      setError("No se pudo crear el negocio. Revisá reglas, permisos y variables de Firebase.");
    } finally {
      setSaving(false);
    }
  }

  async function updateBusinessStatus(business: AdminBusiness, estado: BusinessStatus) {
    if (!db) return;
    await updateDoc(doc(db, "negocios", business.id), {
      estado,
      activo: estado !== "suspended" && estado !== "cancelled",
      billingStatus: estado === "active" || estado === "trial" ? "manual_active" : estado === "past_due" ? "manual_past_due" : "manual_suspended",
      updatedAt: serverTimestamp()
    });
  }

  async function updateLeadStatus(leadId: string, status: string) {
    if (!db) return;
    await updateDoc(doc(db, "leads", leadId), { status, updatedAt: serverTimestamp() });
  }

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
        <p className="mt-2 leading-7 text-ink/65">Cargá las variables `NEXT_PUBLIC_FIREBASE_*` en Vercel y en `.env.local` para usar este panel.</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <ShieldAlert className="text-action" size={30} />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-teal">Acceso restringido</h2>
        <p className="mt-2 leading-7 text-ink/65">Ingresá en `/login` con un usuario que tenga `role: "superadmin"` e `isActive: true` en `businessUsers`.</p>
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

      <form className="grid gap-4 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft lg:grid-cols-4" onSubmit={handleCreateBusiness}>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Negocio
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="nombre" required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Slug
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="slug" placeholder="victorias-estetica" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Rubro
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="rubro" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Plan
          <select className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="plan">
            {Object.entries(planLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Dueño
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="ownerNombre" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Email dueño
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="ownerEmail" type="email" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Teléfono dueño
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="ownerTelefono" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          WhatsApp visible
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="whatsapp" placeholder="549381..." />
        </label>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream transition hover:bg-action disabled:cursor-wait disabled:opacity-70 lg:col-span-4" disabled={saving} type="submit">
          <PlusCircle size={18} />
          {saving ? "Creando..." : "Crear negocio"}
        </button>
        {message ? <p className="rounded-2xl bg-mint p-4 text-sm font-bold text-teal lg:col-span-4">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 lg:col-span-4">{error}</p> : null}
      </form>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl font-extrabold text-teal">Negocios</h2>
        {businesses.map((business) => (
          <article className="grid gap-4 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft lg:grid-cols-[1fr_auto]" key={business.id}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl font-extrabold text-teal">{business.nombre}</h3>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-teal">{planLabels[business.plan]}</span>
                <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-teal">{statusLabels[business.estado]}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink/62">{business.rubro ?? "Sin rubro"} · {business.ownerNombre ?? "Sin dueño asignado"}</p>
              <Link className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-action" href={`/agenda/${business.slug}`} target="_blank">
                {siteUrl}/agenda/{business.slug} <ExternalLink size={16} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-teal" onClick={() => navigator.clipboard?.writeText(`${siteUrl}/agenda/${business.slug}`)} type="button">
                <Copy size={16} /> Copiar
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream" onClick={() => updateBusinessStatus(business, "active")} type="button">
                <PlayCircle size={16} /> Activar
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-teal" onClick={() => updateBusinessStatus(business, "suspended")} type="button">
                <PauseCircle size={16} /> Suspender
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" onClick={() => updateBusinessStatus(business, "cancelled")} type="button">
                <XCircle size={16} /> Cancelar
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl font-extrabold text-teal">Últimos leads</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {leads.map((lead) => (
            <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-5" key={lead.id}>
              <p className="font-display text-xl font-extrabold text-teal">{lead.businessName ?? "Negocio"}</p>
              <p className="mt-1 text-sm font-semibold text-ink/62">{lead.name} · {lead.phone}</p>
              <p className="mt-2 text-sm text-ink/62">{lead.businessType} · {lead.interestedPlan}</p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-xl bg-mint px-3 py-2 text-xs font-bold text-teal" onClick={() => updateLeadStatus(lead.id, "contacted")} type="button">
                  Contactado
                </button>
                <button className="rounded-xl bg-gold/30 px-3 py-2 text-xs font-bold text-teal" onClick={() => updateLeadStatus(lead.id, "won")} type="button">
                  Ganado
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
