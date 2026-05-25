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
import { BarChart3, Building2, CalendarCheck, Copy, Download, ExternalLink, Loader2, MapPin, MessageCircle, PlusCircle, Save, Search, Settings2, ShieldAlert, Trash2, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
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
  signupDate?: string;
  billingStartDate?: string;
  nextPaymentDue?: string;
  monthlyPrice?: number;
};

type ServiceItem = {
  id: string;
  nombre?: string;
  duracionMin?: number;
  precio?: number;
  activo?: boolean;
  orden?: number;
  personalIds?: string[];
  sucursalIds?: string[];
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
  precio?: number;
  fecha?: string;
  hora?: string;
  estado?: string;
  personalNombre?: string;
  sucursalNombre?: string;
  horarioOcupadoIds?: string[];
};

type DaySchedule = {
  activo: boolean;
  rangos: Array<{ inicio: string; fin: string }>;
};

type ScheduleConfig = {
  intervaloMin: number;
  diasReservaMax: number;
  anticipacionHoras: number;
  horariosPorDia: Record<string, DaySchedule>;
};

const weekDays = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const defaultSchedule: ScheduleConfig = {
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

const planLabels: Record<string, string> = {
  agenda_simple: "Agenda Full",
  agenda_pro: "Agenda Full interno",
  web_completa: "Web Completa"
};

const statusLabels: Record<string, string> = {
  trial: "Prueba",
  active: "Activo",
  past_due: "Pago pendiente",
  suspended: "Suspendido",
  cancelled: "Cancelado"
};

const reservationStatusLabels: Record<string, string> = {
  confirmada: "Confirmado",
  atendida: "Atendido",
  ausente: "Ausente",
  cancelada: "Cancelado"
};

function reservationStatusClass(status?: string) {
  if (status === "cancelada") return "bg-red-50 text-red-700";
  if (status === "ausente") return "bg-gold/25 text-teal";
  if (status === "atendida") return "bg-mint text-teal";
  return "bg-paper text-teal ring-1 ring-ink/10";
}

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

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value ?? 0);
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

function reservationDateTimeValue(reservation: ReservationItem) {
  return new Date(`${reservation.fecha ?? "1970-01-01"}T${reservation.hora ?? "00:00"}:00`).getTime();
}

function topBy(reservations: ReservationItem[], key: keyof ReservationItem) {
  const counts = new Map<string, number>();
  reservations.forEach((reservation) => {
    const value = reservation[key];
    if (typeof value !== "string" || !value.trim()) return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  const [name, count] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? ["Sin datos", 0];
  return { name, count };
}

function topListBy(reservations: ReservationItem[], key: keyof ReservationItem, limit = 5) {
  const counts = new Map<string, number>();
  reservations.forEach((reservation) => {
    const value = reservation[key];
    if (typeof value !== "string" || !value.trim()) return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function groupReservationsByDate(reservations: ReservationItem[], limit = 7) {
  const counts = new Map<string, number>();
  reservations.forEach((reservation) => {
    if (!reservation.fecha) return;
    counts.set(reservation.fecha, (counts.get(reservation.fecha) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-limit)
    .map(([name, count]) => ({ name, count }));
}

function readSchedule(data: Record<string, unknown> | undefined): ScheduleConfig {
  if (!data) return defaultSchedule;
  const rawDays = data.horariosPorDia && typeof data.horariosPorDia === "object" ? data.horariosPorDia as Record<string, unknown> : null;
  const horariosPorDia = rawDays ? Object.fromEntries(weekDays.map((day) => {
    const raw = rawDays[day] && typeof rawDays[day] === "object" ? rawDays[day] as { activo?: unknown; rangos?: unknown } : undefined;
    const rangos = Array.isArray(raw?.rangos)
      ? raw.rangos
          .map((range) => {
            const item = range && typeof range === "object" ? range as { inicio?: unknown; fin?: unknown } : {};
            return { inicio: String(item.inicio ?? ""), fin: String(item.fin ?? "") };
          })
          .filter((range) => range.inicio && range.fin)
      : defaultSchedule.horariosPorDia[day].rangos;

    return [day, { activo: raw?.activo === true, rangos }];
  })) as Record<string, DaySchedule> : defaultSchedule.horariosPorDia;

  return {
    intervaloMin: Number(data.intervaloMin ?? defaultSchedule.intervaloMin),
    diasReservaMax: Number(data.diasReservaMax ?? defaultSchedule.diasReservaMax),
    anticipacionHoras: Number(data.anticipacionHoras ?? defaultSchedule.anticipacionHoras),
    horariosPorDia
  };
}

function setupWarnings(business: PanelBusiness, servicesCount: number, staffCount: number, branchesCount: number, schedule: ScheduleConfig) {
  const warnings: string[] = [];
  if (!business.whatsapp) warnings.push("Cargar WhatsApp visible");
  if (!business.logoUrl && !business.initials) warnings.push("Cargar logo o iniciales");
  if (!servicesCount) warnings.push("Agregar al menos un servicio");
  if (!staffCount) warnings.push("Agregar personal");
  if (!branchesCount) warnings.push("Agregar sucursal");
  if (!Object.values(schedule.horariosPorDia).some((day) => day.activo && day.rangos.length)) warnings.push("Configurar horarios");
  return warnings;
}

function resizeLogo(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas_failed"));
          return;
        }
        context.fillStyle = "#F7F4EE";
        context.fillRect(0, 0, size, size);
        const ratio = Math.min(size / image.width, size / image.height);
        const width = image.width * ratio;
        const height = image.height * ratio;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        resolve(canvas.toDataURL("image/webp", 0.86));
      };
      image.onerror = () => reject(new Error("image_failed"));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("reader_failed"));
    reader.readAsDataURL(file);
  });
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
  const [schedule, setSchedule] = useState<ScheduleConfig>(defaultSchedule);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "turnos" | "configuracion">("dashboard");
  const [dashboardRange, setDashboardRange] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [turnSearch, setTurnSearch] = useState("");
  const [turnStatusFilter, setTurnStatusFilter] = useState<"today" | "upcoming" | "all" | "cancelled" | "done">("upcoming");

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
          onSnapshot(query(collection(activeDb, "negocios", userData.negocioId, "reservas"), orderBy("fechaHora", "desc"), limit(200)), (snapshot) => {
            setReservations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
          })
        );
        unsubscribers.push(
          onSnapshot(doc(activeDb, "negocios", userData.negocioId, "configuracion", "general"), (snapshot) => {
            setSchedule(readSchedule(snapshot.data()));
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
  const billingDaysLeft = daysUntil(business.nextPaymentDue);
  const todayKey = dateKeyInArgentina();
  const confirmedReservations = reservations.filter((reservation) => reservation.estado !== "cancelada");
  const cancelledReservations = reservations.filter((reservation) => reservation.estado === "cancelada");
  const attendedReservations = reservations.filter((reservation) => reservation.estado === "atendida");
  const noShowReservations = reservations.filter((reservation) => reservation.estado === "ausente");
  const upcomingReservations = confirmedReservations
    .filter((reservation) => (reservation.fecha ?? "") >= todayKey)
    .sort((a, b) => reservationDateTimeValue(a) - reservationDateTimeValue(b))
    .slice(0, 20);
  const todayReservations = confirmedReservations.filter((reservation) => reservation.fecha === todayKey);
  const nextSevenDaysLimit = new Date();
  nextSevenDaysLimit.setDate(nextSevenDaysLimit.getDate() + 7);
  const nextSevenDaysKey = dateKeyInArgentina(nextSevenDaysLimit);
  const nextSevenDaysReservations = confirmedReservations.filter((reservation) => {
    const date = reservation.fecha ?? "";
    return date >= todayKey && date <= nextSevenDaysKey;
  });
  const estimatedRevenue = confirmedReservations.reduce((total, reservation) => total + (typeof reservation.precio === "number" ? reservation.precio : 0), 0);
  const rangeStartKey = (() => {
    if (dashboardRange === "all") return "";
    const date = new Date();
    if (dashboardRange === "today") return todayKey;
    date.setDate(date.getDate() - (dashboardRange === "7d" ? 7 : 30));
    return dateKeyInArgentina(date);
  })();
  const rangeReservations = confirmedReservations.filter((reservation) => !rangeStartKey || (reservation.fecha ?? "") >= rangeStartKey);
  const rangeRevenue = rangeReservations.reduce((total, reservation) => total + (typeof reservation.precio === "number" ? reservation.precio : 0), 0);
  const topService = topBy(rangeReservations, "servicioNombre");
  const topStaff = topBy(rangeReservations, "personalNombre");
  const topBranch = topBy(rangeReservations, "sucursalNombre");
  const topServices = topListBy(rangeReservations, "servicioNombre");
  const dailyReservations = groupReservationsByDate(rangeReservations);
  const maxDailyReservations = Math.max(1, ...dailyReservations.map((item) => item.count));
  const uniqueClients = new Set(confirmedReservations.map((reservation) => normalizePhone(reservation.telefono ?? "")).filter(Boolean)).size;
  const completedTotal = attendedReservations.length + noShowReservations.length;
  const attendanceRate = completedTotal ? Math.round((attendedReservations.length / completedTotal) * 100) : 0;
  const nextReservation = upcomingReservations[0];
  const averageTicket = rangeReservations.length ? Math.round(rangeRevenue / rangeReservations.length) : 0;
  const activeServices = services.filter((service) => service.activo !== false);
  const activeStaff = staff.filter((person) => person.activo !== false);
  const activeBranches = branches.filter((branch) => branch.activo !== false);
  const pendingSetup = setupWarnings(business, activeServices.length, activeStaff.length, activeBranches.length, schedule);
  const visibleReservations = (turnStatusFilter === "cancelled" ? cancelledReservations : turnStatusFilter === "done" ? [...attendedReservations, ...noShowReservations] : turnStatusFilter === "today" ? todayReservations : turnStatusFilter === "all" ? reservations : upcomingReservations)
    .filter((reservation) => {
      const value = turnSearch.toLowerCase().trim();
      if (!value) return true;
      return [reservation.clienteNombre, reservation.telefono, reservation.servicioNombre, reservation.personalNombre, reservation.sucursalNombre, reservation.fecha, reservation.hora]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(value));
    })
    .sort((a, b) => reservationDateTimeValue(a) - reservationDateTimeValue(b));
  const setupChecklist = [
    { label: "Datos públicos", done: Boolean(business.nombre && business.whatsapp) },
    { label: "Logo o iniciales", done: Boolean(business.logoUrl || business.initials) },
    { label: "Servicios", done: services.some((service) => service.activo !== false) },
    { label: "Personal", done: staff.some((person) => person.activo !== false) },
    { label: "Sucursales", done: branches.some((branch) => branch.activo !== false) },
    { label: "Horarios", done: Object.values(schedule.horariosPorDia).some((day) => day.activo && day.rangos.length) }
  ];
  const setupProgress = Math.round((setupChecklist.filter((item) => item.done).length / setupChecklist.length) * 100);

  async function copyPublicLink() {
    try {
      await navigator.clipboard?.writeText(publicLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("No se pudo copiar el link.");
    }
  }

  async function copyReservationSummary(reservation: ReservationItem) {
    const text = `${reservation.clienteNombre ?? "Cliente"} - ${reservation.servicioNombre ?? "Servicio"} - ${reservation.fecha ?? "Sin fecha"} ${reservation.hora ?? ""}`;
    try {
      await navigator.clipboard?.writeText(text);
      setMessage("Resumen del turno copiado.");
    } catch {
      setError("No se pudo copiar el resumen del turno.");
    }
  }

  function reservationWhatsAppHref(reservation: ReservationItem) {
    const phone = normalizePhone(reservation.telefono ?? "");
    const text = `Hola ${reservation.clienteNombre ?? ""}, te escribo por tu turno de ${reservation.servicioNombre ?? "servicio"} para el ${reservation.fecha ?? ""} a las ${reservation.hora ?? ""} en ${business?.nombre ?? "el negocio"}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
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

  function exportReservationsCsv() {
    const headers = ["cliente", "telefono", "servicio", "fecha", "hora", "profesional", "sucursal", "estado", "precio"];
    const csv = [headers, ...visibleReservations.map((reservation) => [
      reservation.clienteNombre,
      reservation.telefono,
      reservation.servicioNombre,
      reservation.fecha,
      reservation.hora,
      reservation.personalNombre,
      reservation.sucursalNombre,
      reservation.estado ?? "confirmada",
      reservation.precio ?? 0
    ])]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${business?.slug ?? "tuagendaweb"}-turnos-${dateKeyInArgentina()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function cancelReservationFromPanel(reservation: ReservationItem) {
    if (!canEdit) return;
    const confirmed = window.confirm(`¿Cancelar el turno de ${reservation.clienteNombre ?? "este cliente"}?`);
    if (!confirmed) return;
    setSaving(`cancel-${reservation.id}`);
    setError("");
    try {
      await updateDoc(doc(activeDb, "negocios", businessId, "reservas", reservation.id), {
        estado: "cancelada",
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await Promise.all((reservation.horarioOcupadoIds ?? []).map((occupiedId) => deleteDoc(doc(activeDb, "negocios", businessId, "horariosOcupados", occupiedId))));
      setMessage("Turno cancelado y horario liberado.");
    } catch {
      setError("No se pudo cancelar el turno desde el panel.");
    } finally {
      setSaving("");
    }
  }

  async function updateReservationStatus(reservation: ReservationItem, estado: "confirmada" | "atendida" | "ausente") {
    if (!canEdit) return;
    setSaving(`${estado}-${reservation.id}`);
    setError("");
    try {
      await updateDoc(doc(activeDb, "negocios", businessId, "reservas", reservation.id), {
        estado,
        updatedAt: serverTimestamp()
      });
      setMessage(`Turno actualizado a ${estado}.`);
    } catch {
      setError("No se pudo actualizar el estado del turno.");
    } finally {
      setSaving("");
    }
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !canEdit) return;
    if (!file.type.startsWith("image/")) {
      setError("Subí una imagen válida para el logo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El logo no puede pesar más de 5 MB.");
      return;
    }

    setSaving("logo");
    setError("");
    try {
      const logoUrl = await resizeLogo(file);
      await updateDoc(doc(activeDb, "negocios", businessId), {
        logoUrl,
        updatedAt: serverTimestamp()
      });
      setMessage("Logo cargado correctamente.");
    } catch {
      setError("No se pudo cargar el logo.");
    } finally {
      setSaving("");
      event.target.value = "";
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
        personalIds: formData.getAll("personalIds").map(String),
        sucursalIds: formData.getAll("sucursalIds").map(String),
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

  async function toggleServiceRelation(service: ServiceItem, field: "personalIds" | "sucursalIds", value: string) {
    const current = new Set((service[field] ?? []).map(String));
    if (current.has(value)) current.delete(value);
    else current.add(value);
    await updateService(service, { [field]: Array.from(current) } as Partial<ServiceItem>);
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
    const horariosPorDia = Object.fromEntries(weekDays.map((day) => {
      const activo = formData.get(`${day}-activo`) === "on";
      const rangos = [
        { inicio: String(formData.get(`${day}-inicio-1`) ?? ""), fin: String(formData.get(`${day}-fin-1`) ?? "") },
        { inicio: String(formData.get(`${day}-inicio-2`) ?? ""), fin: String(formData.get(`${day}-fin-2`) ?? "") }
      ].filter((range) => range.inicio && range.fin && range.inicio < range.fin);
      return [day, { activo, rangos: activo ? rangos : [] }];
    })) as Record<string, DaySchedule>;

    setSaving("schedule");
    setError("");
    try {
      await setDoc(
        doc(activeDb, "negocios", businessId, "configuracion", "general"),
        {
          diasAtencion: weekDays.filter((day) => horariosPorDia[day].activo),
          horarioInicio: "09:00",
          horarioFin: "18:00",
          intervaloMin: Math.max(5, toNumber(formData.get("intervaloMin"), 30)),
          diasReservaMax: Math.max(1, toNumber(formData.get("diasReservaMax"), 21)),
          anticipacionHoras: Math.max(0, toNumber(formData.get("anticipacionHoras"), 1)),
          horariosPorDia,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      setMessage("Horarios guardados correctamente.");
    } catch {
      setError("No se pudieron guardar los horarios.");
    } finally {
      setSaving("");
    }
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
        <div className="mt-5 grid gap-3 text-sm font-bold text-cream/80 sm:grid-cols-3">
          <p className="rounded-2xl border border-cream/15 px-4 py-3">Alta: {formatDateKey(business.signupDate ?? business.billingStartDate)}</p>
          <p className="rounded-2xl border border-cream/15 px-4 py-3">Proximo cobro: {formatDateKey(business.nextPaymentDue)}</p>
          <p className="rounded-2xl border border-cream/15 px-4 py-3">{billingDaysLeft === null ? "Cobro sin fecha" : billingDaysLeft < 0 ? `Vencido hace ${Math.abs(billingDaysLeft)} dias` : billingDaysLeft === 0 ? "Vence hoy" : `Vence en ${billingDaysLeft} dias`}</p>
        </div>
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

      <nav className="grid gap-2 rounded-[1.5rem] border border-ink/10 bg-paper p-2 shadow-soft sm:grid-cols-3" aria-label="Secciones del panel">
        {[
          ["dashboard", "Dashboard", BarChart3],
          ["turnos", "Turnos", CalendarCheck],
          ["configuracion", "Configuracion", Settings2]
        ].map(([tab, label, Icon]) => (
          <button
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${activeTab === tab ? "bg-teal text-cream" : "text-teal hover:bg-mint"}`}
            key={String(tab)}
            onClick={() => setActiveTab(tab as "dashboard" | "turnos" | "configuracion")}
            type="button"
          >
            <Icon size={17} /> {String(label)}
          </button>
        ))}
      </nav>

      {activeTab === "dashboard" ? (
        <section className="grid gap-6">
          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-ink/10 bg-paper p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-teal">Dashboard del negocio</h2>
              <p className="mt-1 text-sm font-semibold text-ink/55">Resumen para entender qué se está reservando y qué falta configurar.</p>
            </div>
            <select className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-sm font-bold text-teal outline-none" onChange={(event) => setDashboardRange(event.target.value as typeof dashboardRange)} value={dashboardRange}>
              <option value="today">Hoy</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="all">Todo</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Turnos confirmados", confirmedReservations.length],
              ["Turnos de hoy", todayReservations.length],
              ["Proximos 7 dias", nextSevenDaysReservations.length],
              ["Clientes unicos", uniqueClients],
              ["Ticket promedio", formatCurrency(averageTicket)],
              ["Asistencia", completedTotal ? `${attendanceRate}%` : "Sin datos"],
              ["Proximo cobro", formatDateKey(business.nextPaymentDue)]
            ].map(([label, value]) => (
              <article className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft" key={String(label)}>
                <p className="text-sm font-bold text-ink/55">{String(label)}</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-teal">{value}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Trophy className="text-action" />
                <h2 className="font-display text-2xl font-extrabold text-teal">Ganadores del negocio</h2>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  ["Servicio ganador", topService.name, topService.count],
                  ["Profesional con mas turnos", topStaff.name, topStaff.count],
                  ["Sucursal ganadora", topBranch.name, topBranch.count]
                ].map(([label, name, count]) => (
                  <article className="rounded-2xl bg-cream p-4" key={String(label)}>
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">{String(label)}</p>
                    <p className="mt-3 font-display text-2xl font-extrabold text-teal">{String(name)}</p>
                    <p className="mt-2 text-sm font-bold text-ink/55">{Number(count)} turnos</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
              <h2 className="font-display text-2xl font-extrabold text-teal">Resumen rapido</h2>
              <div className="mt-5 grid gap-3">
                <p className="rounded-2xl bg-mint p-4 text-sm font-bold text-teal">Facturacion estimada del rango: {formatCurrency(rangeRevenue)}</p>
                <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Facturacion estimada total: {formatCurrency(estimatedRevenue)}</p>
                <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Cancelados registrados: {cancelledReservations.length}</p>
                <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Atendidos: {attendedReservations.length}</p>
                <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Ausentes: {noShowReservations.length}</p>
                <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Servicios activos: {activeServices.length}</p>
                <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Personal activo: {activeStaff.length}</p>
                {nextReservation ? <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Proximo turno: {nextReservation.clienteNombre ?? "Cliente"} - {nextReservation.fecha} {nextReservation.hora}</p> : null}
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
              <h2 className="font-display text-2xl font-extrabold text-teal">Turnos por día</h2>
              <div className="mt-5 grid gap-3">
                {dailyReservations.length ? dailyReservations.map((item) => (
                  <div className="grid gap-2" key={item.name}>
                    <div className="flex items-center justify-between text-sm font-bold text-ink/62">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-cream">
                      <div className="h-full rounded-full bg-action" style={{ width: `${Math.max(8, (item.count / maxDailyReservations) * 100)}%` }} />
                    </div>
                  </div>
                )) : <p className="rounded-2xl bg-cream p-4 font-semibold text-ink/65">Todavía no hay datos en este rango.</p>}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
              <h2 className="font-display text-2xl font-extrabold text-teal">Configuración inicial</h2>
              <p className="mt-2 text-sm font-bold text-ink/55">{setupProgress}% listo</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream">
                <div className="h-full rounded-full bg-action" style={{ width: `${setupProgress}%` }} />
              </div>
              <div className="mt-5 grid gap-2">
                {setupChecklist.map((item) => (
                  <p className={`rounded-2xl px-4 py-3 text-sm font-bold ${item.done ? "bg-mint text-teal" : "bg-cream text-ink/55"}`} key={item.label}>
                    {item.done ? "Listo" : "Pendiente"} · {item.label}
                  </p>
                ))}
              </div>
              {pendingSetup.length ? (
                <div className="mt-4 rounded-2xl bg-gold/20 p-4">
                  <p className="text-sm font-extrabold text-teal">Para dejar la agenda lista:</p>
                  <ul className="mt-2 grid gap-1 text-sm font-semibold text-ink/65">
                    {pendingSetup.slice(0, 4).map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
              ) : null}
            </section>
          </div>

          <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
            <h2 className="font-display text-2xl font-extrabold text-teal">Servicios más reservados</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {topServices.length ? topServices.map((item) => (
                <article className="rounded-2xl bg-cream p-4" key={item.name}>
                  <p className="font-extrabold text-teal">{item.name}</p>
                  <p className="mt-2 text-sm font-bold text-ink/55">{item.count} turnos</p>
                </article>
              )) : <p className="rounded-2xl bg-cream p-4 font-semibold text-ink/65 sm:col-span-2 lg:col-span-5">Todavía no hay servicios reservados.</p>}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
            <h2 className="font-display text-2xl font-extrabold text-teal">Proximos turnos</h2>
            <div className="mt-5 grid gap-3">
              {upcomingReservations.slice(0, 5).map((reservation) => (
                <article className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={reservation.id}>
                  <div>
                    <p className="font-extrabold text-teal">{reservation.servicioNombre ?? "Servicio"}</p>
                    <p className="mt-1 text-sm text-ink/65">{reservation.clienteNombre ?? "Cliente"} - {reservation.fecha} {reservation.hora}</p>
                  </div>
                  <span className="rounded-full bg-mint px-4 py-2 text-xs font-extrabold text-teal">{reservation.personalNombre ?? "Sin profesional"}</span>
                </article>
              ))}
              {!upcomingReservations.length ? <p className="rounded-2xl bg-cream p-4 font-semibold text-ink/65">Todavia no hay turnos proximos.</p> : null}
            </div>
          </section>
        </section>
      ) : null}

      {activeTab === "turnos" ? (
      <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CalendarCheck className="text-action" />
              <h2 className="font-display text-2xl font-extrabold text-teal">Turnos</h2>
            </div>
            <p className="mt-2 leading-7 text-ink/62">Busca, filtra, exporta o cancela turnos desde el panel del negocio.</p>
          </div>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream" onClick={exportReservationsCsv} type="button">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
            <input className="w-full rounded-2xl border border-ink/10 bg-cream py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-action" onChange={(event) => setTurnSearch(event.target.value)} placeholder="Buscar cliente, telefono, servicio o fecha" value={turnSearch} />
          </label>
          <select className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-sm font-bold text-teal outline-none" onChange={(event) => setTurnStatusFilter(event.target.value as typeof turnStatusFilter)} value={turnStatusFilter}>
            <option value="today">Hoy</option>
            <option value="upcoming">Proximos</option>
            <option value="all">Todos</option>
            <option value="cancelled">Cancelados</option>
            <option value="done">Atendidos/ausentes</option>
          </select>
        </div>
        <div className="mt-5 grid gap-3">
          {visibleReservations.length ? visibleReservations.map((reservation) => (
            <article className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={reservation.id}>
              <div>
                <p className="font-extrabold text-teal">{reservation.servicioNombre ?? "Servicio"}</p>
                <p className="mt-1 text-sm text-ink/65">
                  {reservation.clienteNombre ?? "Cliente"} - {reservation.telefono ?? "Sin telefono"}
                </p>
                <p className="mt-1 text-sm font-bold text-ink/70">
                  {reservation.fecha ?? "Sin fecha"} - {reservation.hora ?? "Sin horario"}
                  {reservation.personalNombre ? " - " + reservation.personalNombre : ""}
                  {reservation.sucursalNombre ? " - " + reservation.sucursalNombre : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {reservation.telefono ? (
                  <Link className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2 text-xs font-extrabold text-cream" href={reservationWhatsAppHref(reservation)} rel="noopener noreferrer" target="_blank">
                    <MessageCircle size={14} /> WhatsApp
                  </Link>
                ) : null}
                <button className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-xs font-extrabold text-teal ring-1 ring-ink/10" onClick={() => copyReservationSummary(reservation)} type="button">
                  <Copy size={14} /> Copiar
                </button>
                {reservation.estado !== "cancelada" ? (
                  <>
                  <button className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-xs font-extrabold text-teal disabled:opacity-50" disabled={!canEdit || saving === "atendida-" + reservation.id} onClick={() => updateReservationStatus(reservation, "atendida")} type="button">
                    Atendido
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-gold/25 px-4 py-2 text-xs font-extrabold text-teal disabled:opacity-50" disabled={!canEdit || saving === "ausente-" + reservation.id} onClick={() => updateReservationStatus(reservation, "ausente")} type="button">
                    Ausente
                  </button>
                  {reservation.estado === "atendida" || reservation.estado === "ausente" ? (
                    <button className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-xs font-extrabold text-teal ring-1 ring-ink/10 disabled:opacity-50" disabled={!canEdit || saving === "confirmada-" + reservation.id} onClick={() => updateReservationStatus(reservation, "confirmada")} type="button">
                      Reabrir
                    </button>
                  ) : null}
                  <button className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-extrabold text-red-700 disabled:opacity-50" disabled={!canEdit || saving === "cancel-" + reservation.id} onClick={() => cancelReservationFromPanel(reservation)} type="button">
                    <Trash2 size={14} /> Cancelar
                  </button>
                  </>
                ) : null}
                <span className={`rounded-full px-4 py-2 text-xs font-extrabold ${reservationStatusClass(reservation.estado)}`}>
                  {reservationStatusLabels[reservation.estado ?? "confirmada"] ?? "Confirmado"}
                </span>
              </div>
            </article>
          )) : (
            <p className="rounded-2xl bg-cream p-4 font-semibold text-ink/65">No hay turnos para ese filtro.</p>
          )}
        </div>
      </section>
      ) : null}

      {activeTab === "configuracion" ? (
      <>
      <form className="grid gap-5 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft lg:grid-cols-2" onSubmit={handleBusinessSettings}>
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-extrabold text-teal">Datos públicos del negocio</h2>
          <p className="mt-2 leading-7 text-ink/62">Esto se ve en tu agenda pública. Podés cargar un logo o usar iniciales.</p>
        </div>
        <div className="grid gap-3 rounded-2xl bg-cream p-4 lg:col-span-2 sm:grid-cols-[96px_1fr] sm:items-center">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-paper text-xl font-extrabold text-teal ring-1 ring-ink/10">
            {business.logoUrl ? <img alt={`Logo de ${business.nombre}`} className="h-full w-full object-contain p-2" src={business.logoUrl} /> : business.initials ?? initialsFromName(business.nombre ?? "")}
          </div>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Logo del negocio
            <input accept="image/*" className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-action" disabled={!canEdit || saving === "logo"} onChange={handleLogoUpload} type="file" />
            <span className="text-xs font-semibold text-ink/50">Se optimiza a 512x512 y queda guardado en el negocio.</span>
          </label>
        </div>
        {[
          ["nombre", "Nombre del negocio", business.nombre ?? ""],
          ["rubro", "Rubro", business.rubro ?? ""],
          ["whatsapp", "WhatsApp visible", business.whatsapp ?? ""],
          ["instagram", "Instagram URL", business.instagram ?? ""],
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
        <form className="mt-5 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_140px_160px_124px]" onSubmit={handleService}>
          <input className="min-w-0 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action md:col-span-2 xl:col-span-1" minLength={2} name="nombre" placeholder="Corte + barba" required />
          <input className="min-w-0 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" min={5} name="duracionMin" placeholder="60 min" required step={5} type="number" />
          <label className="relative min-w-0">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-ink/45">$</span>
            <input className="w-full rounded-2xl border border-ink/10 bg-cream py-3 pl-8 pr-4 outline-none focus:border-action" min={0} name="precio" placeholder="Precio" required step={100} type="number" />
          </label>
          <button className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream disabled:opacity-60 md:col-span-2 xl:col-span-1" disabled={!canEdit || saving === "service"} type="submit">
            <PlusCircle size={17} /> Agregar
          </button>
          {(staff.length || branches.length) ? (
            <div className="grid gap-4 rounded-2xl bg-cream p-4 md:col-span-2 md:grid-cols-2 xl:col-span-4">
              {staff.length ? (
                <div>
                  <p className="text-sm font-extrabold text-teal">Personal que realiza este servicio</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {staff.map((person) => (
                      <label className="rounded-full bg-paper px-3 py-2 text-xs font-bold text-ink/70" key={person.id}>
                        <input className="mr-2" name="personalIds" type="checkbox" value={person.id} />
                        {person.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
              {branches.length ? (
                <div>
                  <p className="text-sm font-extrabold text-teal">Sucursales donde se ofrece</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {branches.map((branch) => (
                      <label className="rounded-full bg-paper px-3 py-2 text-xs font-bold text-ink/70" key={branch.id}>
                        <input className="mr-2" name="sucursalIds" type="checkbox" value={branch.id} />
                        {branch.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </form>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {services.map((service) => (
            <article className="rounded-2xl bg-cream p-4" key={service.id}>
              <input className="w-full bg-transparent font-bold text-teal outline-none" defaultValue={service.nombre} onBlur={(event) => updateService(service, { nombre: event.target.value.trim() || service.nombre })} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-xs font-bold text-ink/55">Duración min<input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm text-ink" defaultValue={service.duracionMin ?? 60} onBlur={(event) => updateService(service, { duracionMin: Math.max(5, Number(event.target.value) || 60) })} type="number" /></label>
                <label className="grid gap-1 text-xs font-bold text-ink/55">Precio<input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm text-ink" defaultValue={service.precio ?? 0} onBlur={(event) => updateService(service, { precio: Math.max(0, Number(event.target.value) || 0) })} type="number" /></label>
              </div>
              <p className="mt-2 text-sm font-extrabold text-teal">{formatCurrency(service.precio)}</p>
              {(staff.length || branches.length) ? (
                <div className="mt-4 grid gap-3">
                  {staff.length ? (
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">Personal</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {staff.map((person) => (
                          <button className={`rounded-full px-3 py-2 text-xs font-bold ${service.personalIds?.includes(person.id) ? "bg-teal text-cream" : "bg-paper text-ink/70"}`} key={person.id} onClick={() => toggleServiceRelation(service, "personalIds", person.id)} type="button">
                            {person.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {branches.length ? (
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45">Sucursales</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {branches.map((branch) => (
                          <button className={`rounded-full px-3 py-2 text-xs font-bold ${service.sucursalIds?.includes(branch.id) ? "bg-teal text-cream" : "bg-paper text-ink/70"}`} key={branch.id} onClick={() => toggleServiceRelation(service, "sucursalIds", branch.id)} type="button">
                            {branch.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
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

      <div className="grid min-w-0 gap-6 2xl:grid-cols-2">
        <section className="min-w-0 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Users className="text-action" />
            <h2 className="font-display text-2xl font-extrabold text-teal">Personal</h2>
          </div>
          <form className="mt-5 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_124px]" onSubmit={handleStaff}>
            <input className="min-w-0 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" minLength={2} name="nombre" placeholder="Nombre" required />
            <input className="min-w-0 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="especialidad" placeholder="Especialidad" />
            <button className="min-w-0 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" disabled={!canEdit} type="submit">Agregar</button>
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

        <section className="min-w-0 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <MapPin className="text-action" />
            <h2 className="font-display text-2xl font-extrabold text-teal">Sucursales</h2>
          </div>
          <form className="mt-5 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_124px]" onSubmit={handleBranch}>
            <input className="min-w-0 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" minLength={2} name="nombre" placeholder="Sucursal centro" required />
            <input className="min-w-0 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="direccion" placeholder="Dirección" />
            <button className="min-w-0 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" disabled={!canEdit} type="submit">Agregar</button>
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
          <h2 className="font-display text-2xl font-extrabold text-teal">Horarios de atención</h2>
        </div>
        <p className="mt-2 leading-7 text-ink/62">Definí rangos por día. Por ejemplo, sábado solo por la mañana.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Intervalo
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3" defaultValue={schedule.intervaloMin} name="intervaloMin" type="number" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Días para reservar
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3" defaultValue={schedule.diasReservaMax} name="diasReservaMax" type="number" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Anticipación mínima en horas
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3" defaultValue={schedule.anticipacionHoras} name="anticipacionHoras" type="number" />
          </label>
        </div>
        <div className="mt-5 grid gap-3">
          {weekDays.map((day) => {
            const dayConfig = schedule.horariosPorDia[day] ?? defaultSchedule.horariosPorDia[day];
            const firstRange = dayConfig.rangos[0] ?? { inicio: "09:00", fin: "18:00" };
            const secondRange = dayConfig.rangos[1] ?? { inicio: "", fin: "" };
            return (
              <div className="grid gap-3 rounded-2xl bg-cream p-4 lg:grid-cols-[150px_1fr_1fr] lg:items-end" key={day}>
                <label className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 text-sm font-extrabold capitalize text-teal">
                  <input defaultChecked={dayConfig.activo} name={`${day}-activo`} type="checkbox" />
                  {day}
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-bold text-ink/55">Desde<input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm" defaultValue={firstRange.inicio} name={`${day}-inicio-1`} type="time" /></label>
                  <label className="grid gap-1 text-xs font-bold text-ink/55">Hasta<input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm" defaultValue={firstRange.fin} name={`${day}-fin-1`} type="time" /></label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-bold text-ink/55">Desde opcional<input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm" defaultValue={secondRange.inicio} name={`${day}-inicio-2`} type="time" /></label>
                  <label className="grid gap-1 text-xs font-bold text-ink/55">Hasta opcional<input className="rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm" defaultValue={secondRange.fin} name={`${day}-fin-2`} type="time" /></label>
                </div>
              </div>
            );
          })}
        </div>
        <button className="mt-5 w-full rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream disabled:opacity-60" disabled={!canEdit || saving === "schedule"} type="submit">
          {saving === "schedule" ? "Guardando horarios..." : "Guardar horarios"}
        </button>
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
      </>
      ) : null}
    </div>
  );
}
