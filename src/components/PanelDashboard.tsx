"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { CalendarCheck, ExternalLink, Loader2, Settings2, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteUrl } from "@/data/site";
import { getClientAuth, getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";

type BusinessUser = {
  negocioId?: string;
  role?: string;
  isActive?: boolean;
};

type PanelBusiness = {
  nombre?: string;
  slug?: string;
  plan?: string;
  estado?: string;
  whatsapp?: string;
};

export function PanelDashboard() {
  const auth = useMemo(() => getClientAuth(), []);
  const db = useMemo(() => getClientDb(), []);
  const [loading, setLoading] = useState(true);
  const [businessUser, setBusinessUser] = useState<BusinessUser | null>(null);
  const [business, setBusiness] = useState<PanelBusiness | null>(null);

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !auth || !db) {
      setLoading(false);
      return;
    }

    let unsubscribeBusiness: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeBusiness?.();
      if (!user) {
        setBusinessUser(null);
        setBusiness(null);
        setLoading(false);
        return;
      }

      const userSnapshot = await getDoc(doc(db, "businessUsers", user.uid));
      const userData = userSnapshot.data() as BusinessUser | undefined;
      if (!userData?.isActive || !userData.negocioId) {
        setBusinessUser(userData ?? null);
        setBusiness(null);
        setLoading(false);
        return;
      }

      setBusinessUser(userData);
      unsubscribeBusiness = onSnapshot(query(collection(db, "negocios"), where("__name__", "==", userData.negocioId)), (snapshot) => {
        setBusiness(snapshot.docs[0]?.data() ?? null);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeBusiness?.();
      unsubscribeAuth();
    };
  }, [auth, db]);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 text-center shadow-soft">
        <Loader2 className="mx-auto animate-spin text-action" />
        <p className="mt-4 font-bold text-teal">Cargando panel...</p>
      </div>
    );
  }

  if (!isFirebaseClientConfigured() || !businessUser?.isActive || !businessUser.negocioId || !business) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <ShieldAlert className="text-action" size={30} />
        <h1 className="mt-4 font-display text-3xl font-extrabold text-teal">Panel no disponible</h1>
        <p className="mt-3 leading-7 text-ink/65">
          Ingresá con un usuario activo asociado a un negocio. El alta se asigna desde Super Admin en `businessUsers`.
        </p>
        <Link className="mt-5 inline-flex rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" href="/login">
          Ir al login
        </Link>
      </div>
    );
  }

  const publicLink = `${siteUrl}/agenda/${business.slug}`;

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-teal p-8 text-cream shadow-soft">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gold">Panel cliente</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold">{business.nombre}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-cream/75">
          Plan: {business.plan ?? "agenda_simple"} · Estado: {business.estado ?? "trial"}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="inline-flex items-center gap-2 rounded-2xl bg-action px-5 py-3 text-sm font-bold text-white" href={`/agenda/${business.slug}`} rel="noopener noreferrer" target="_blank">
            Ver agenda pública <ExternalLink size={16} />
          </Link>
          <button className="rounded-2xl border border-cream/20 px-5 py-3 text-sm font-bold" onClick={() => auth && signOut(auth)} type="button">
            Cerrar sesión
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Próximos turnos", CalendarCheck, "Módulo listo para conectar reservas reales del turnero."],
          ["Servicios", Settings2, "La edición completa se habilita en la siguiente fase del panel."],
          ["Personal y sucursales", Users, "Preparado para negocios con varios profesionales o sedes."],
          ["Link público", ExternalLink, publicLink]
        ].map(([title, Icon, text]) => (
          <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 shadow-soft" key={title as string}>
            <Icon className="text-action" size={28} />
            <h2 className="mt-4 font-display text-2xl font-extrabold text-teal">{title as string}</h2>
            <p className="mt-2 break-words leading-7 text-ink/65">{text as string}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
