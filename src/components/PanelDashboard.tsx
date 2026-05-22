"use client";

import { EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, signOut, updatePassword } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { Building2, CalendarCheck, Copy, ExternalLink, Loader2, MapPin, PlusCircle, Save, Settings2, ShieldAlert, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { siteUrl } from "@/data/site";
import { getClientAuth, getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { normalizePhone } from "@/lib/phone";

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
  rubro?: string;
  whatsapp?: string;
  instagram?: string;
  logoUrl?: string;
  initials?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  ownerNombre?: string;
  ownerTelefono?: string;
  ownerEmail?: string;
};

type ServiceItem = {
  id: string;
  nombre?: string;
  duracionMin?: number;
  precio?: number;
  activo?: boolean;
  orden?: number;
};

type StaffItem = {
  id: string;
  nombre?: string;
  especialidad?: string;
  activo?: boolean;
};

type BranchItem = {
  id: string;
  nombre?: string;
  direccion?: string;
  activo?: boolean;
};

type ReservationItem = {
  id: string;
  clienteNombre?: string;
  telefono?: string;
  servicioNombre?: string;
  fecha?: string;
  hora?: string;
  estado?: string;
  personalNombre?: string;
  sucursalNombre?: string;
};

const planLabels: Record<string, string> = {
  agenda_simple: "Agenda Simple",
  agenda_pro: "Agenda Pro",
  web_completa: "Web Completa"
};

const statusLabels: Record<string, string> = {
  trial: "Prueba",
  active: "Activo",
  past_due: "Pago pendiente",
  suspended: "Suspendido",
  cancelled: "Cancelado"
};

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function PanelDashboard() {
  const auth = useMemo(() => getClientAuth(), []);
  const db = useMemo(() => getClientDb(), []);
  const [loading, setLoading] = useState(true);
  const [businessUser, setBusinessUser] = useState<BusinessUser | null>(null);
  const [businessId, setBusinessId] = useState("");
  const [business, setBusiness] = useState<PanelBusiness | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    if (!isFirebaseClientConfigured() || !auth || !db) {
      setLoading(false);
      return;
    }

    const activeDb = db;
    const unsubscribers: Array<() => void> = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
      setMessage("");
      setError("");

      if (!user) {
        setBusinessUser(null);
        setBusiness(null);
        setBusinessId("");
        setReservations([]);
        setLoading(false);
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(activeDb, "businessUsers", user.uid));
        const userData = userSnapshot.data() as BusinessUser | undefined;

        if (!userData?.isActive || !userData.negocioId) {
          setBusinessUser(userData ?? null);
          setBusiness(null);
          setBusinessId("");
          setReservations([]);
          setLoading(false);
          return;
        }

        setBusinessUser(userData);
        setBusinessId(userData.negocioId);

        unsubscribers.push(
          onSnapshot(doc(activeDb, "negocios", userData.negocioId), (snapshot) => {
            setBusiness(snapshot.exists() ? (snapshot.data() as PanelBusiness) : null);
            setLoading(false);
          })
        );
        unsubscribers.push(
          onSnapshot(query(collection(activeDb, "negocios", userData.negocioId, "servicios"), orderBy("orden", "asc")), (snapshot) => {
            setServices(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
          })
        );
        unsubscribers.push(
          onSnapshot(query(collection(activeDb, "negocios", userData.negocioId, "personal"), orderBy("nombre", "asc")), (snapshot) => {
            setStaff(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
          })
        );
        unsubscribers.push(
          onSnapshot(query(collection(activeDb, "negocios", userData.negocioId, "sucursales"), orderBy("nombre", "asc")), (snapshot) => {
            setBranches(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
          })
        );
        unsubscribers.push(
          onSnapshot(query(collection(activeDb, "negocios", userData.negocioId, "reservas"), orderBy("fechaHora", "asc"), limit(20)), (snapshot) => {
            setReservations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
          })
        );
      } catch {
        setError("No se pudo cargar el panel. Revisá que el usuario esté activo y tenga permisos.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
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

  if (!isFirebaseClientConfigured() || !businessUser?.isActive || !businessUser.negocioId || !business || !businessId || !db) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <ShieldAlert className="text-action" size={30} />
        <h1 className="mt-4 font-display text-3xl font-extrabold text-teal">Panel no disponible</h1>
        <p className="mt-3 leading-7 text-ink/65">Ingresá con un usuario activo asociado a un negocio. El alta se asigna desde Super Admin.</p>
        <Link className="mt-5 inline-flex rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" href="/login">
          Ir al login
        </Link>
      </div>
    );
  }

  const activeDb = db;
  const publicLink = `${siteUrl}/${business.slug}`;
  const canEdit = business.estado !== "suspended" && business.estado !== "cancelled";

  async function copyPublicLink() {
    try {
      await navigator.clipboard?.writeText(publicLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("No se pudo copiar el link.");
    }
  }

  async function handleBusinessSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      setError("La agenda no se puede editar mientras esté suspendida o cancelada.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const nombre = String(formData.get("nombre") ?? "").trim();
    const initials = String(formData.get("initials") ?? "").trim().toUpperCase() || initialsFromName(nombre);

    if (nombre.length < 2) {
      setError("El nombre del negocio es obligatorio.");
      return;
    }

    setSaving("business");
    setError("");
    try {
      await updateDoc(doc(activeDb, "negocios", businessId), {
        nombre,
        rubro: String(formData.get("rubro") ?? "").trim(),
        whatsapp: normalizePhone(String(formData.get("whatsapp") ?? "")),
        instagram: String(formData.get("instagram") ?? "").trim(),
        logoUrl: String(formData.get("logoUrl") ?? "").trim(),
        initials: initials.slice(0, 3),
        colorPrimario: String(formData.get("colorPrimario") ?? "#123D3A"),
        colorSecundario: String(formData.get("colorSecundario") ?? "#E7B85A"),
        ownerNombre: String(formData.get("ownerNombre") ?? "").trim(),
        ownerTelefono: normalizePhone(String(formData.get("ownerTelefono") ?? "")),
        updatedAt: serverTimestamp()
      });
      setMessage("Datos públicos actualizados.");
    } catch {
      setError("No se pudieron guardar los datos del negocio.");
    } finally {
      setSaving("");
    }
  }

  async function handleService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") ?? "").trim();
    if (nombre.length < 2) {
      setError("El servicio necesita un nombre.");
      return;
    }

    setSaving("service");
    setError("");
    try {
      await addDoc(collection(activeDb, "negocios", businessId, "servicios"), {
        nombre,
        duracionMin: Math.max(5, toNumber(formData.get("duracionMin"), 60)),
        precio: Math.max(0, toNumber(formData.get("precio"), 0)),
        activo: true,
        orden: services.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      form.reset();
      setMessage("Servicio agregado.");
    } catch {
      setError("No se pudo agregar el servicio.");
    } finally {
      setSaving("");
    }
  }

  async function updateService(service: ServiceItem, patch: Partial<ServiceItem>) {
    if (!canEdit) return;
    await updateDoc(doc(activeDb, "negocios", businessId, "servicios", service.id), { ...patch, updatedAt: serverTimestamp() });
  }

  async function handleStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") ?? "").trim();
    if (nombre.length < 2) return;

    await addDoc(collection(activeDb, "negocios", businessId, "personal"), {
      nombre,
      especialidad: String(formData.get("especialidad") ?? "").trim(),
      activo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    form.reset();
    setMessage("Persona agregada.");
  }

  async function handleBranch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") ?? "").trim();
    if (nombre.length < 2) return;

    await addDoc(collection(activeDb, "negocios", businessId, "sucursales"), {
      nombre,
      direccion: String(formData.get("direccion") ?? "").trim(),
      activo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    form.reset();
    setMessage("Sucursal agregada.");
  }

  async function saveBasicSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    const formData = new FormData(event.currentTarget);
    await setDoc(
      doc(activeDb, "negocios", businessId, "configuracion", "general"),
      {
        diasAtencion: formData.getAll("diasAtencion"),
        horarioInicio: String(formData.get("horarioInicio") ?? "09:00"),
        horarioFin: String(formData.get("horarioFin") ?? "18:00"),
        intervaloMin: Math.max(5, toNumber(formData.get("intervaloMin"), 30)),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    setMessage("Horarios básicos guardados.");
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = auth?.currentUser;
    if (!user?.email) {
      setError("No se pudo validar el usuario actual.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const repeatPassword = String(formData.get("repeatPassword") ?? "");

    if (newPassword.length < 6 || newPassword !== repeatPassword) {
      setError("La nueva contraseña debe tener al menos 6 caracteres y coincidir en ambos campos.");
      return;
    }

    setSaving("password");
    setError("");
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      form.reset();
      setMessage("Contraseña actualizada correctamente.");
    } catch {
      setError("No se pudo cambiar la contraseña. Revisá la contraseña actual e intentá nuevamente.");
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-teal p-6 text-cream shadow-soft sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gold">Panel cliente</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold">{business.nombre}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-cream/75">
          Plan: {planLabels[business.plan ?? "agenda_simple"] ?? business.plan} · Estado: {statusLabels[business.estado ?? "trial"] ?? business.estado}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="inline-flex items-center gap-2 rounded-2xl bg-action px-5 py-3 text-sm font-bold text-white" href={`/${business.slug}`} rel="noopener noreferrer" target="_blank">
            Ver agenda pública <ExternalLink size={16} />
          </Link>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-cream/20 px-5 py-3 text-sm font-bold" onClick={copyPublicLink} type="button">
            <Copy size={16} /> {copied ? "Link copiado" : "Copiar link"}
          </button>
          <button className="rounded-2xl border border-cream/20 px-5 py-3 text-sm font-bold" onClick={() => auth && signOut(auth)} type="button">
            Cerrar sesión
          </button>
        </div>
        {!canEdit ? <p className="mt-5 rounded-2xl bg-gold/20 p-4 text-sm font-bold text-cream">La agenda está suspendida o cancelada. Podés ver datos, pero no editar.</p> : null}
      </section>

      <div aria-live="polite">
        {message ? <p className="rounded-2xl bg-mint p-4 text-sm font-bold text-teal">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      </div>

      <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <CalendarCheck className="text-action" />
          <h2 className="font-display text-2xl font-extrabold text-teal">Próximos turnos</h2>
        </div>
        <p className="mt-2 leading-7 text-ink/62">Acá ves los turnos que entran desde tu agenda pública. Para cancelar un turno, el cliente puede hacerlo desde la sección de consulta con su WhatsApp.</p>
        <div className="mt-5 grid gap-3">
          {reservations.length ? reservations.map((reservation) => (
            <article className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={reservation.id}>
              <div>
                <p className="font-extrabold text-teal">{reservation.servicioNombre ?? "Servicio"}</p>
                <p className="mt-1 text-sm text-ink/65">
                  {reservation.clienteNombre ?? "Cliente"} · {reservation.telefono ?? "Sin teléfono"}
                </p>
                <p className="mt-1 text-sm font-bold text-ink/70">
                  {reservation.fecha ?? "Sin fecha"} · {reservation.hora ?? "Sin horario"}
                  {reservation.personalNombre ? ` · ${reservation.personalNombre}` : ""}
                  {reservation.sucursalNombre ? ` · ${reservation.sucursalNombre}` : ""}
                </p>
              </div>
              <span className={`rounded-full px-4 py-2 text-xs font-extrabold ${reservation.estado === "cancelada" ? "bg-red-50 text-red-700" : "bg-mint text-teal"}`}>
                {reservation.estado ?? "confirmada"}
              </span>
            </article>
          )) : (
            <p className="rounded-2xl bg-cream p-4 font-semibold text-ink/65">Todavía no hay turnos cargados.</p>
          )}
        </div>
      </section>

      <form className="grid gap-5 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft lg:grid-cols-2" onSubmit={handleBusinessSettings}>
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-extrabold text-teal">Datos públicos del negocio</h2>
          <p className="mt-2 leading-7 text-ink/62">Esto se ve en tu agenda pública. Podés usar logo por URL o iniciales.</p>
        </div>
        {[
          ["nombre", "Nombre del negocio", business.nombre ?? ""],
          ["rubro", "Rubro", business.rubro ?? ""],
          ["whatsapp", "WhatsApp visible", business.whatsapp ?? ""],
          ["instagram", "Instagram URL", business.instagram ?? ""],
          ["logoUrl", "Logo URL", business.logoUrl ?? ""],
          ["initials", "Iniciales si no tenés logo", business.initials ?? initialsFromName(business.nombre ?? "")],
          ["ownerNombre", "Nombre de contacto", business.ownerNombre ?? ""],
          ["ownerTelefono", "Teléfono de contacto", business.ownerTelefono ?? ""]
        ].map(([name, label, value]) => (
          <label className="grid gap-2 text-sm font-bold text-ink/70" key={name}>
            {label}
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={value} name={name} />
          </label>
        ))}
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Color principal
          <input className="h-12 rounded-2xl border border-ink/10 bg-cream px-3 py-2" defaultValue={business.colorPrimario ?? "#123D3A"} name="colorPrimario" type="color" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Color secundario
          <input className="h-12 rounded-2xl border border-ink/10 bg-cream px-3 py-2" defaultValue={business.colorSecundario ?? "#E7B85A"} name="colorSecundario" type="color" />
        </label>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream disabled:opacity-60 lg:col-span-2" disabled={!canEdit || saving === "business"} type="submit">
          <Save size={18} /> {saving === "business" ? "Guardando..." : "Guardar datos públicos"}
        </button>
      </form>

      <form className="grid gap-4 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft lg:grid-cols-3" onSubmit={handlePasswordChange}>
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl font-extrabold text-teal">Cambiar contraseña</h2>
          <p className="mt-2 leading-7 text-ink/62">Usá esto después de ingresar con la contraseña inicial que te pasó TuAgendaWeb.</p>
        </div>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Contraseña actual
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="currentPassword" required type="password" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Nueva contraseña
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="newPassword" required type="password" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Repetir nueva contraseña
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="repeatPassword" required type="password" />
        </label>
        <button className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream disabled:opacity-60 lg:col-span-3" disabled={saving === "password"} type="submit">
          {saving === "password" ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>

      <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Settings2 className="text-action" />
          <h2 className="font-display text-2xl font-extrabold text-teal">Servicios</h2>
        </div>
        <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_140px_140px_auto]" onSubmit={handleService}>
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="nombre" placeholder="Corte + barba" />
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="duracionMin" placeholder="60 min" type="number" />
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="precio" placeholder="Precio" type="number" />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream disabled:opacity-60" disabled={!canEdit || saving === "service"} type="submit">
            <PlusCircle size={17} /> Agregar
          </button>
        </form>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {services.map((service) => (
            <article className="rounded-2xl bg-cream p-4" key={service.id}>
              <input className="w-full bg-transparent font-bold text-teal outline-none" defaultValue={service.nombre} onBlur={(event) => updateService(service, { nombre: event.target.value.trim() || service.nombre })} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm" defaultValue={service.duracionMin ?? 60} onBlur={(event) => updateService(service, { duracionMin: Math.max(5, Number(event.target.value) || 60) })} type="number" />
                <input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm" defaultValue={service.precio ?? 0} onBlur={(event) => updateService(service, { precio: Math.max(0, Number(event.target.value) || 0) })} type="number" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-xl bg-mint px-3 py-2 text-xs font-bold text-teal" onClick={() => updateService(service, { activo: service.activo === false })} type="button">
                  {service.activo === false ? "Activar" : "Pausar"}
                </button>
                <button className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700" onClick={() => deleteDoc(doc(activeDb, "negocios", businessId, "servicios", service.id))} type="button">
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Users className="text-action" />
            <h2 className="font-display text-2xl font-extrabold text-teal">Personal</h2>
          </div>
          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleStaff}>
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="nombre" placeholder="Nombre" />
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="especialidad" placeholder="Especialidad" />
            <button className="rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" disabled={!canEdit} type="submit">Agregar</button>
          </form>
          <div className="mt-4 grid gap-2">
            {staff.map((person) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream p-4" key={person.id}>
                <p className="font-bold text-teal">{person.nombre}<span className="block text-xs font-semibold text-ink/50">{person.especialidad}</span></p>
                <button className="text-xs font-bold text-red-700" onClick={() => deleteDoc(doc(activeDb, "negocios", businessId, "personal", person.id))} type="button">Eliminar</button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <MapPin className="text-action" />
            <h2 className="font-display text-2xl font-extrabold text-teal">Sucursales</h2>
          </div>
          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleBranch}>
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="nombre" placeholder="Sucursal centro" />
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="direccion" placeholder="Dirección" />
            <button className="rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" disabled={!canEdit} type="submit">Agregar</button>
          </form>
          <div className="mt-4 grid gap-2">
            {branches.map((branch) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream p-4" key={branch.id}>
                <p className="font-bold text-teal">{branch.nombre}<span className="block text-xs font-semibold text-ink/50">{branch.direccion}</span></p>
                <button className="text-xs font-bold text-red-700" onClick={() => deleteDoc(doc(activeDb, "negocios", businessId, "sucursales", branch.id))} type="button">Eliminar</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <form className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft" onSubmit={saveBasicSchedule}>
        <div className="flex items-center gap-3">
          <CalendarCheck className="text-action" />
          <h2 className="font-display text-2xl font-extrabold text-teal">Horarios básicos</h2>
        </div>
        <p className="mt-2 leading-7 text-ink/62">Estos datos dejan preparada la disponibilidad base del negocio.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Inicio
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3" defaultValue="09:00" name="horarioInicio" type="time" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Fin
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3" defaultValue="18:00" name="horarioFin" type="time" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Intervalo
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3" defaultValue="30" name="intervaloMin" type="number" />
          </label>
          <button className="self-end rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" disabled={!canEdit} type="submit">Guardar horarios</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map((day) => (
            <label className="rounded-full bg-mint px-4 py-2 text-sm font-bold text-teal" key={day}>
              <input className="mr-2" defaultChecked={day !== "domingo"} name="diasAtencion" type="checkbox" value={day} />
              {day}
            </label>
          ))}
        </div>
      </form>

      <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Building2 className="text-action" />
          <h2 className="font-display text-2xl font-extrabold text-teal">Qué sigue</h2>
        </div>
        <p className="mt-3 leading-7 text-ink/65">
          Con datos, servicios, personal, sucursales y horarios cargados, la agenda pública ya puede recibir reservas reales. Los turnos se bloquean para evitar duplicados y el cliente puede consultar o cancelar desde su celular.
        </p>
      </section>
    </div>
  );
}
