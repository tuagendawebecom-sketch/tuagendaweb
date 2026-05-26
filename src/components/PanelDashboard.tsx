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
import { AlertTriangle, BarChart3, Building2, CalendarCheck, CheckCircle2, ChevronDown, Clock3, Copy, Download, ExternalLink, Eye, FileSpreadsheet, Loader2, MapPin, MessageCircle, PlusCircle, Save, Search, Settings2, ShieldAlert, Trash2, TrendingUp, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { siteUrl } from "@/data/site";
import { getClientAuth, getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { normalizePhone } from "@/lib/phone";
import type { PublicWebContent } from "@/types/tenant";

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
  customDomain?: string;
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

const defaultPanelWebContent: PublicWebContent = {
  heroEtiqueta: "Atencion personalizada",
  heroTitulo: "Tu negocio con una web propia y reservas online.",
  heroSubtitulo: "Mostra tu propuesta, servicios, horarios, redes y formas de contacto en una experiencia clara para tus clientes.",
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
  sobreTitulo: "Sobre el negocio",
  sobreTexto: "Esta seccion puede contar que hace el negocio, que lo diferencia y como quiere recibir a sus clientes.",
  serviciosEtiqueta: "Servicios",
  queHacemosTitulo: "Servicios claros y faciles de reservar.",
  queHacemosTexto: "Cada servicio puede mostrar duracion, precio y disponibilidad para que el cliente avance sin dudas.",
  beneficiosEtiqueta: "Beneficios",
  beneficiosTitulo: "Una forma mas simple de atender",
  beneficioDetalleTexto: "Una experiencia mas clara, humana y consistente para cada cliente.",
  beneficio1Titulo: "Reserva desde el celular",
  beneficio1Texto: "El cliente puede elegir servicio, dia y horario sin esperar una respuesta manual.",
  beneficio2Titulo: "Informacion clara",
  beneficio2Texto: "Servicios, horarios, contacto y redes quedan reunidos en una experiencia profesional.",
  beneficio3Titulo: "Mejor organizacion",
  beneficio3Texto: "Cada reserva queda registrada para administrar la agenda desde el panel.",
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
  finalCtaTitulo: "Reserva tu turno",
  finalCtaTexto: "Elegi servicio, profesional, sucursal, dia y horario desde esta misma pagina.",
  heroImageUrl: "",
  galeriaImageUrl1: "",
  galeriaImageUrl2: "",
  seccion5ImageUrl: "",
  direccion: "",
  zonaAtencion: "Atencion personalizada",
  contactoTitulo: "Contacto",
  linksTitulo: "Links",
  mapaTexto: "Abrir mapa",
  mapaLinkUrl: "",
  mapaEmbedUrl: "",
  footerTexto: "Web propia con reserva online y contacto directo.",
  footerLegalTexto: "Atencion profesional con agenda online.",
  facebook: ""
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

function groupReport(reservations: ReservationItem[], key: keyof ReservationItem) {
  const grouped = new Map<string, { count: number; revenue: number }>();
  reservations.forEach((reservation) => {
    const raw = reservation[key];
    const name = typeof raw === "string" && raw.trim() ? raw : "Sin datos";
    const current = grouped.get(name) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += typeof reservation.precio === "number" ? reservation.precio : 0;
    grouped.set(name, current);
  });
  return Array.from(grouped.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue);
}

function uniqueClientReport(reservations: ReservationItem[]) {
  const clients = new Map<string, { name: string; phone: string; count: number; revenue: number; lastDate: string }>();
  reservations.forEach((reservation) => {
    const phone = normalizePhone(reservation.telefono ?? "") || "sin-telefono";
    const current = clients.get(phone) ?? { name: reservation.clienteNombre ?? "Cliente", phone, count: 0, revenue: 0, lastDate: "" };
    current.count += 1;
    current.revenue += typeof reservation.precio === "number" ? reservation.precio : 0;
    current.lastDate = [current.lastDate, reservation.fecha ?? ""].sort().at(-1) ?? current.lastDate;
    clients.set(phone, current);
  });
  return Array.from(clients.values()).sort((a, b) => b.count - a.count);
}

function xmlCell(value: string | number) {
  const isNumber = typeof value === "number" && Number.isFinite(value);
  const text = String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${text}</Data></Cell>`;
}

function xmlSheet(name: string, headers: string[], rows: Array<Array<string | number>>) {
  const safeName = name.replace(/[\\/?*[\]:]/g, " ").slice(0, 31);
  const headerRow = `<Row ss:StyleID="Header">${headers.map(xmlCell).join("")}</Row>`;
  const bodyRows = rows.map((row) => `<Row>${row.map(xmlCell).join("")}</Row>`).join("");
  return `<Worksheet ss:Name="${safeName}"><Table>${headerRow}${bodyRows}</Table></Worksheet>`;
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

function readWebContent(data: Record<string, unknown> | undefined): PublicWebContent {
  const read = (key: keyof PublicWebContent) => {
    const value = data?.[key];
    return typeof value === "string" && value.trim() ? value.trim() : defaultPanelWebContent[key];
  };

  return Object.fromEntries(
    (Object.keys(defaultPanelWebContent) as Array<keyof PublicWebContent>).map((key) => [key, read(key)])
  ) as PublicWebContent;
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

function PanelMetricCard({
  helper,
  icon,
  label,
  tone = "default",
  value
}: {
  helper?: string;
  icon: ReactNode;
  label: string;
  tone?: "default" | "strong" | "warning";
  value: ReactNode;
}) {
  const toneClass =
    tone === "strong"
      ? "bg-teal text-cream"
      : tone === "warning"
        ? "bg-gold/20 text-teal"
        : "bg-paper text-teal";
  const helperClass = tone === "strong" ? "text-cream/70" : "text-ink/55";

  return (
    <article className={`rounded-[1.5rem] border border-ink/10 p-5 shadow-soft ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-bold ${tone === "strong" ? "text-cream/75" : "text-ink/55"}`}>{label}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tone === "strong" ? "bg-cream/10 text-cream" : "bg-cream text-action"}`}>
          {icon}
        </span>
      </div>
      <p className={`mt-3 font-display text-3xl font-extrabold ${tone === "strong" ? "text-cream" : "text-teal"}`}>{value}</p>
      {helper ? <p className={`mt-2 text-xs font-semibold leading-5 ${helperClass}`}>{helper}</p> : null}
    </article>
  );
}

function WebEditSection({
  children,
  defaultOpen = false,
  description,
  title
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: string;
  title: string;
}) {
  return (
    <details className="group rounded-[1.5rem] border border-ink/10 bg-paper p-0 shadow-soft" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[1.5rem] px-5 py-4">
        <span>
          <span className="block font-display text-xl font-extrabold text-teal">{title}</span>
          <span className="mt-1 block text-sm font-semibold leading-6 text-ink/55">{description}</span>
        </span>
        <ChevronDown className="shrink-0 text-action transition group-open:rotate-180" size={20} />
      </summary>
      <div className="grid gap-4 border-t border-ink/10 p-5 lg:grid-cols-2">{children}</div>
    </details>
  );
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
  const [webContent, setWebContent] = useState<PublicWebContent>(defaultPanelWebContent);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "turnos" | "configuracion" | "web">("dashboard");
  const [dashboardRange, setDashboardRange] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [turnSearch, setTurnSearch] = useState("");
  const [turnStatusFilter, setTurnStatusFilter] = useState<"today" | "upcoming" | "all" | "cancelled" | "done">("upcoming");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");

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
            const data = snapshot.data();
            setSchedule(readSchedule(data));
            setWebContent(readWebContent(data));
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
  const publicWebLink = business.customDomain ? `https://${business.customDomain}` : publicLink;
  const reservationLink = business.customDomain ? `https://${business.customDomain}/reservar` : publicLink;
  const canEdit = business.estado !== "suspended" && business.estado !== "cancelled";
  const isWebComplete = business.plan === "web_completa";
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
  const rangeLabel = dashboardRange === "today" ? "hoy" : dashboardRange === "7d" ? "ultimos 7 dias" : dashboardRange === "30d" ? "ultimos 30 dias" : "todo el historial";
  const dashboardHealth = pendingSetup.length
    ? { label: "Necesita configuracion", text: `${pendingSetup.length} pendiente${pendingSetup.length === 1 ? "" : "s"} antes de vender con tranquilidad.`, tone: "warning" as const }
    : nextReservation
      ? { label: "Agenda operativa", text: "Ya tenes datos cargados y proximos turnos para gestionar.", tone: "strong" as const }
      : { label: "Lista para recibir turnos", text: "La agenda esta configurada. Compartila para empezar a medir reservas.", tone: "strong" as const };
  const nextAction = pendingSetup[0]
    ? `Proximo paso: ${pendingSetup[0]}.`
    : upcomingReservations.length
      ? "Proximo paso: revisar y confirmar los turnos cercanos."
      : "Proximo paso: compartir el link publico y generar las primeras reservas.";

  function showSuccess(text: string) {
    setError("");
    setMessage(text);
  }

  function showError(text: string) {
    setMessage("");
    setError(text);
  }

  async function copyPublicLink() {
    try {
      await navigator.clipboard?.writeText(reservationLink);
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
      showSuccess("Datos públicos actualizados correctamente.");
    } catch {
      showError("No se pudieron guardar los datos del negocio.");
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

  function exportBusinessReportXlsx() {
    if (reportStart && reportEnd && reportStart > reportEnd) {
      showError("La fecha desde no puede ser posterior a la fecha hasta.");
      return;
    }
    const start = reportStart || "0000-01-01";
    const end = reportEnd || "9999-12-31";
    const reportReservations = reservations
      .filter((reservation) => {
        const date = reservation.fecha ?? "";
        return date >= start && date <= end;
      })
      .sort((a, b) => reservationDateTimeValue(a) - reservationDateTimeValue(b));
    const activeReportReservations = reportReservations.filter((reservation) => reservation.estado !== "cancelada");
    const cancelledReportReservations = reportReservations.filter((reservation) => reservation.estado === "cancelada");
    const revenue = activeReportReservations.reduce((total, reservation) => total + (typeof reservation.precio === "number" ? reservation.precio : 0), 0);

    setSaving("report");
    setError("");
    try {
      const sheets = [
        xmlSheet(
          "Resumen",
          ["Metrica", "Valor"],
        [
          ["Negocio", business?.nombre ?? "Negocio"],
          ["Periodo desde", reportStart || "Sin limite"],
          ["Periodo hasta", reportEnd || "Sin limite"],
          ["Turnos totales", reportReservations.length],
          ["Turnos activos", activeReportReservations.length],
          ["Cancelados", cancelledReportReservations.length],
          ["Atendidos", activeReportReservations.filter((reservation) => reservation.estado === "atendida").length],
          ["Ausentes", activeReportReservations.filter((reservation) => reservation.estado === "ausente").length],
          ["Facturacion estimada", revenue],
          ["Ticket promedio", activeReportReservations.length ? Math.round(revenue / activeReportReservations.length) : 0],
          ["Clientes unicos", uniqueClientReport(activeReportReservations).length]
        ]
        ),
        xmlSheet(
          "Turnos",
          ["Fecha", "Hora", "Cliente", "Telefono", "Servicio", "Profesional", "Sucursal", "Estado", "Precio"],
          reportReservations.map((reservation) => [
            reservation.fecha ?? "",
            reservation.hora ?? "",
            reservation.clienteNombre ?? "",
            reservation.telefono ?? "",
            reservation.servicioNombre ?? "",
            reservation.personalNombre ?? "",
            reservation.sucursalNombre ?? "",
            reservationStatusLabels[reservation.estado ?? "confirmada"] ?? "Confirmado",
            reservation.precio ?? 0
          ])
        ),
        xmlSheet("Servicios ganadores", ["Nombre", "Turnos", "Facturacion"], groupReport(activeReportReservations, "servicioNombre").map((item) => [item.name, item.count, item.revenue])),
        xmlSheet("Personal ganador", ["Nombre", "Turnos", "Facturacion"], groupReport(activeReportReservations, "personalNombre").map((item) => [item.name, item.count, item.revenue])),
        xmlSheet("Sucursales ganadoras", ["Nombre", "Turnos", "Facturacion"], groupReport(activeReportReservations, "sucursalNombre").map((item) => [item.name, item.count, item.revenue])),
        xmlSheet("Clientes", ["Cliente", "Telefono", "Turnos", "Facturacion", "Ultimo turno"], uniqueClientReport(activeReportReservations).map((item) => [item.name, item.phone, item.count, item.revenue, item.lastDate])),
        xmlSheet("Turnos por dia", ["Fecha", "Turnos"], groupReservationsByDate(activeReportReservations, 999).map((item) => [item.name, item.count]))
      ];
      const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#123D3A" ss:Pattern="Solid"/></Style>
 </Styles>
 ${sheets.join("")}
</Workbook>`;
      const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${business?.slug ?? "tuagendaweb"}-reporte-${reportStart || "inicio"}-${reportEnd || dateKeyInArgentina()}.xls`;
      link.click();
      URL.revokeObjectURL(url);
      showSuccess("Reporte Excel generado correctamente.");
    } catch {
      showError("No se pudo generar el reporte Excel.");
    } finally {
      setSaving("");
    }
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
      showSuccess("Turno cancelado y horario liberado.");
    } catch {
      showError("No se pudo cancelar el turno desde el panel.");
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
      showSuccess(`Turno actualizado a ${estado}.`);
    } catch {
      showError("No se pudo actualizar el estado del turno.");
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
      showSuccess("Logo cargado correctamente. Ya se puede ver en la agenda pública.");
    } catch {
      showError("No se pudo cargar el logo.");
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
      showSuccess("Servicio agregado correctamente.");
    } catch {
      showError("No se pudo agregar el servicio.");
    } finally {
      setSaving("");
    }
  }

  async function updateService(service: ServiceItem, patch: Partial<ServiceItem>) {
    if (!canEdit) return;
    setSaving(`service-${service.id}`);
    try {
      await updateDoc(doc(activeDb, "negocios", businessId, "servicios", service.id), { ...patch, updatedAt: serverTimestamp() });
      showSuccess("Servicio actualizado correctamente.");
    } catch {
      showError("No se pudo actualizar el servicio.");
    } finally {
      setSaving("");
    }
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

    setSaving("staff");
    setError("");
    try {
      await addDoc(collection(activeDb, "negocios", businessId, "personal"), {
        nombre,
        especialidad: String(formData.get("especialidad") ?? "").trim(),
        activo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      form.reset();
      showSuccess("Persona agregada correctamente.");
    } catch {
      showError("No se pudo agregar la persona.");
    } finally {
      setSaving("");
    }
  }

  async function handleBranch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") ?? "").trim();
    if (nombre.length < 2) return;

    setSaving("branch");
    setError("");
    try {
      await addDoc(collection(activeDb, "negocios", businessId, "sucursales"), {
        nombre,
        direccion: String(formData.get("direccion") ?? "").trim(),
        activo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      form.reset();
      showSuccess("Sucursal agregada correctamente.");
    } catch {
      showError("No se pudo agregar la sucursal.");
    } finally {
      setSaving("");
    }
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
      showSuccess("Horarios guardados correctamente.");
    } catch {
      showError("No se pudieron guardar los horarios.");
    } finally {
      setSaving("");
    }
  }

  async function handleWebContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || !isWebComplete) return;

    const formData = new FormData(event.currentTarget);
    const payload = { ...webContent };
    (Object.keys(defaultPanelWebContent) as Array<keyof PublicWebContent>).forEach((key) => {
      if (formData.has(key)) {
        payload[key] = String(formData.get(key) ?? "").trim();
      }
    });

    if (payload.heroTitulo.length < 8 || payload.heroSubtitulo.length < 12) {
      showError("La web necesita un titulo y una descripcion principal mas claros.");
      return;
    }

    setSaving("web");
    setError("");
    try {
      await setDoc(
        doc(activeDb, "negocios", businessId, "configuracion", "general"),
        { ...payload, updatedAt: serverTimestamp() },
        { merge: true }
      );
      showSuccess("Contenido de Web Completa actualizado correctamente.");
    } catch {
      showError("No se pudo guardar el contenido de la web.");
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
          <Link className="inline-flex items-center gap-2 rounded-2xl bg-action px-5 py-3 text-sm font-bold text-white" href={business.customDomain ? publicWebLink : reservationLink} rel="noopener noreferrer" target="_blank">
            Ver agenda pública <ExternalLink size={16} />
          </Link>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-cream/20 px-5 py-3 text-sm font-bold" onClick={copyPublicLink} type="button">
            <Copy size={16} /> {copied ? "Link copiado" : "Copiar reservas"}
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

      <nav className={`grid gap-2 rounded-[1.5rem] border border-ink/10 bg-paper p-2 shadow-soft ${isWebComplete ? "sm:grid-cols-4" : "sm:grid-cols-3"}`} aria-label="Secciones del panel">
        {[
          ["dashboard", "Dashboard", BarChart3],
          ["turnos", "Turnos", CalendarCheck],
          ["configuracion", "Configuracion", Settings2],
          ...(isWebComplete ? [["web", "Web completa", Building2]] : [])
        ].map(([tab, label, Icon]) => (
          <button
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${activeTab === tab ? "bg-teal text-cream" : "text-teal hover:bg-mint"}`}
            key={String(tab)}
            onClick={() => setActiveTab(tab as "dashboard" | "turnos" | "configuracion" | "web")}
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
          <section className="grid gap-4 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="flex items-start gap-4">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${dashboardHealth.tone === "warning" ? "bg-gold/25 text-teal" : "bg-mint text-teal"}`}>
                {dashboardHealth.tone === "warning" ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Estado operativo</p>
                <h3 className="mt-1 font-display text-2xl font-extrabold text-teal">{dashboardHealth.label}</h3>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-ink/60">{dashboardHealth.text}</p>
                <p className="mt-3 rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-ink/65">{nextAction}</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[460px]">
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream" onClick={() => setActiveTab("turnos")} type="button">
                <CalendarCheck size={16} /> Ver turnos
              </button>
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-teal" onClick={() => setActiveTab("configuracion")} type="button">
                <Settings2 size={16} /> Configurar
              </button>
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm font-bold text-teal ring-1 ring-ink/10" href={reservationLink} target="_blank">
                <Eye size={16} /> Ver agenda
              </Link>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PanelMetricCard helper={`Reservas no canceladas en ${rangeLabel}.`} icon={<CalendarCheck size={19} />} label="Turnos del rango" tone="strong" value={rangeReservations.length} />
            <PanelMetricCard helper="Estimado por precio de los servicios reservados." icon={<TrendingUp size={19} />} label="Facturacion estimada" value={formatCurrency(rangeRevenue)} />
            <PanelMetricCard helper="Promedio por turno dentro del rango elegido." icon={<FileSpreadsheet size={19} />} label="Ticket promedio" value={formatCurrency(averageTicket)} />
            <PanelMetricCard helper={completedTotal ? "Calculado con turnos atendidos o ausentes." : "Marca turnos como atendidos/ausentes para medir."} icon={<CheckCircle2 size={19} />} label="Asistencia" value={completedTotal ? `${attendanceRate}%` : "Sin datos"} />
            <PanelMetricCard helper="Turnos confirmados para el dia actual." icon={<Clock3 size={19} />} label="Turnos de hoy" value={todayReservations.length} />
            <PanelMetricCard helper="Turnos confirmados entre hoy y los proximos 7 dias." icon={<CalendarCheck size={19} />} label="Proximos 7 dias" value={nextSevenDaysReservations.length} />
            <PanelMetricCard helper="Telefonos unicos en reservas no canceladas." icon={<Users size={19} />} label="Clientes unicos" value={uniqueClients} />
            <PanelMetricCard helper={billingDaysLeft === null ? "Cargalo desde Super Admin." : billingDaysLeft < 0 ? "Vencido, revisar cobro." : `${billingDaysLeft} dias restantes.`} icon={<Clock3 size={19} />} label="Proximo cobro" tone={billingDaysLeft !== null && billingDaysLeft <= 3 ? "warning" : "default"} value={formatDateKey(business.nextPaymentDue)} />
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
              <p className="mt-2 text-sm font-semibold text-ink/55">Lectura ejecutiva para tomar decisiones sin revisar cada turno.</p>
              <div className="mt-5 grid gap-3">
                {[
                  ["Facturacion del rango", formatCurrency(rangeRevenue), "bg-mint text-teal"],
                  ["Facturacion total", formatCurrency(estimatedRevenue), "bg-cream text-ink/65"],
                  ["Cancelados", cancelledReservations.length, "bg-cream text-ink/65"],
                  ["Atendidos", attendedReservations.length, "bg-cream text-ink/65"],
                  ["Ausentes", noShowReservations.length, "bg-cream text-ink/65"],
                  ["Servicios activos", activeServices.length, "bg-cream text-ink/65"],
                  ["Personal activo", activeStaff.length, "bg-cream text-ink/65"]
                ].map(([label, value, className]) => (
                  <p className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-bold ${className}`} key={String(label)}>
                    <span>{String(label)}</span>
                    <span className="font-display text-lg font-extrabold">{value}</span>
                  </p>
                ))}
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-teal">Reporte profesional</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-ink/60">
                  Exporta un Excel con resumen economico, turnos, servicios ganadores, personal, sucursales, clientes y turnos por dia.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[150px_150px_auto]">
                <input aria-label="Desde" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-sm font-bold outline-none focus:border-action" onChange={(event) => setReportStart(event.target.value)} type="date" value={reportStart} />
                <input aria-label="Hasta" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-sm font-bold outline-none focus:border-action" onChange={(event) => setReportEnd(event.target.value)} type="date" value={reportEnd} />
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream disabled:opacity-60" disabled={saving === "report"} onClick={exportBusinessReportXlsx} type="button">
                  <Download size={16} /> {saving === "report" ? "Generando..." : "Exportar reporte"}
                </button>
              </div>
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

      {activeTab === "web" && isWebComplete ? (
      <form className="grid gap-5 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft" onSubmit={handleWebContent}>
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Building2 className="text-action" />
            <h2 className="font-display text-2xl font-extrabold text-teal">Contenido de Web Completa</h2>
          </div>
          <p className="mt-2 leading-7 text-ink/62">
            Esta edicion solo aparece para clientes de Web Completa. Los cambios se aplican en su web publica y pagina de reserva, no en la identidad del panel.
          </p>
          <p className="mt-3 rounded-2xl bg-mint p-4 text-sm font-bold text-teal">
            Agenda Full mantiene solo datos publicos, colores de reserva, servicios, personal, sucursales y horarios.
          </p>
        </div>

        <WebEditSection defaultOpen description="Lo primero que ve el cliente: titulo, subtitulo, botones e imagen principal." title="1. Portada de la web">
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Etiqueta del hero
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.heroEtiqueta} name="heroEtiqueta" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Texto del boton principal
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.ctaPrincipalTexto} name="ctaPrincipalTexto" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Texto boton WhatsApp
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.ctaSecundarioTexto} name="ctaSecundarioTexto" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Subtitulo junto al logo
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.landingSubtituloMarca} name="landingSubtituloMarca" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          Titulo principal
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.heroTitulo} name="heroTitulo" required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          Subtitulo principal
          <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.heroSubtitulo} name="heroSubtitulo" required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          URL de imagen principal
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.heroImageUrl} name="heroImageUrl" placeholder="https://... o /assets/clientes/imagen.jpg" />
        </label>
        {[
          ["heroCardEtiqueta", "Etiqueta de la tarjeta sobre imagen", webContent.heroCardEtiqueta],
          ["heroCardTitulo", "Titulo de la tarjeta sobre imagen", webContent.heroCardTitulo],
          ["heroCardTexto", "Texto de la tarjeta sobre imagen", webContent.heroCardTexto],
          ["galeriaImageUrl1", "Imagen secundaria 1", webContent.galeriaImageUrl1],
          ["galeriaImageUrl2", "Imagen secundaria 2", webContent.galeriaImageUrl2],
          ["seccion5ImageUrl", "Imagen de experiencia", webContent.seccion5ImageUrl]
        ].map(([name, label, value]) => (
          <label className="grid gap-2 text-sm font-bold text-ink/70" key={name}>
            {label}
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={value} name={name} />
          </label>
        ))}
        </WebEditSection>

        <WebEditSection description="Presentacion del negocio y textos que explican que ofrece antes de reservar." title="2. Presentacion y servicios">
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Titulo sobre el negocio
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.sobreTitulo} name="sobreTitulo" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Titulo beneficios
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.beneficiosTitulo} name="beneficiosTitulo" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          Texto sobre el negocio
          <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.sobreTexto} name="sobreTexto" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Etiqueta servicios
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.serviciosEtiqueta} name="serviciosEtiqueta" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Titulo servicios
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.queHacemosTitulo} name="queHacemosTitulo" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          Texto servicios
          <textarea className="min-h-24 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.queHacemosTexto} name="queHacemosTexto" />
        </label>
        </WebEditSection>

        <WebEditSection description="Argumentos de confianza que aparecen en tarjetas dentro de la web." title="3. Beneficios">
        {[
          ["beneficiosEtiqueta", "Etiqueta beneficios", webContent.beneficiosEtiqueta],
          ["beneficio1Titulo", "Beneficio 1 - titulo", webContent.beneficio1Titulo],
          ["beneficio1Texto", "Beneficio 1 - texto", webContent.beneficio1Texto],
          ["beneficio2Titulo", "Beneficio 2 - titulo", webContent.beneficio2Titulo],
          ["beneficio2Texto", "Beneficio 2 - texto", webContent.beneficio2Texto],
          ["beneficio3Titulo", "Beneficio 3 - titulo", webContent.beneficio3Titulo],
          ["beneficio3Texto", "Beneficio 3 - texto", webContent.beneficio3Texto]
        ].map(([name, label, value]) => (
          <label className="grid gap-2 text-sm font-bold text-ink/70" key={name}>
            {label}
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={value} name={name} />
          </label>
        ))}
        </WebEditSection>

        <WebEditSection description="Tres opciones o bloques comerciales para destacar servicios, paquetes o propuestas." title="4. Opciones destacadas">
          <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-3">
            Titulo opciones/paquetes
            <input className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-action" defaultValue={webContent.paquetesTitulo} name="paquetesTitulo" />
          </label>
          {[
            ["paquete1Nombre", "Opcion 1", webContent.paquete1Nombre],
            ["paquete2Nombre", "Opcion 2", webContent.paquete2Nombre],
            ["paquete3Nombre", "Opcion 3", webContent.paquete3Nombre],
            ["paquete1Texto", "Texto opcion 1", webContent.paquete1Texto],
            ["paquete2Texto", "Texto opcion 2", webContent.paquete2Texto],
            ["paquete3Texto", "Texto opcion 3", webContent.paquete3Texto]
          ].map(([name, label, value]) => (
            <label className="grid gap-2 text-sm font-bold text-ink/70" key={name}>
              {label}
              <input className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-action" defaultValue={value} name={name} />
            </label>
          ))}
        </WebEditSection>

        <WebEditSection description="Bloques de experiencia visual: ambiente, trato, confianza y diferenciales." title="5. Experiencia">
        {[
          ["menuEtiqueta", "Etiqueta experiencia", webContent.menuEtiqueta],
          ["menuTitulo", "Titulo experiencia", webContent.menuTitulo],
          ["experiencia1Titulo", "Experiencia 1 - titulo", webContent.experiencia1Titulo],
          ["experiencia1Texto", "Experiencia 1 - texto", webContent.experiencia1Texto],
          ["experiencia2Titulo", "Experiencia 2 - titulo", webContent.experiencia2Titulo],
          ["experiencia2Texto", "Experiencia 2 - texto", webContent.experiencia2Texto],
          ["experiencia3Titulo", "Experiencia 3 - titulo", webContent.experiencia3Titulo],
          ["experiencia3Texto", "Experiencia 3 - texto", webContent.experiencia3Texto]
        ].map(([name, label, value]) => (
          <label className="grid gap-2 text-sm font-bold text-ink/70" key={name}>
            {label}
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={value} name={name} />
          </label>
        ))}
        </WebEditSection>

        <WebEditSection description="Preguntas frecuentes para resolver dudas antes de que el cliente escriba o reserve." title="6. Preguntas frecuentes">
        {[
          ["faqEtiqueta", "Etiqueta FAQ", webContent.faqEtiqueta],
          ["faqTitulo", "Titulo FAQ", webContent.faqTitulo],
          ["faq1Pregunta", "Pregunta 1", webContent.faq1Pregunta],
          ["faq1Respuesta", "Respuesta 1", webContent.faq1Respuesta],
          ["faq2Pregunta", "Pregunta 2", webContent.faq2Pregunta],
          ["faq2Respuesta", "Respuesta 2", webContent.faq2Respuesta],
          ["faq3Pregunta", "Pregunta 3", webContent.faq3Pregunta],
          ["faq3Respuesta", "Respuesta 3", webContent.faq3Respuesta]
        ].map(([name, label, value]) => (
          <label className="grid gap-2 text-sm font-bold text-ink/70" key={name}>
            {label}
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={value} name={name} />
          </label>
        ))}
        </WebEditSection>

        <WebEditSection description="Datos finales, redes, mapa y textos de cierre de la web." title="7. Contacto y cierre">
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Titulo final de reserva
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.finalCtaTitulo} name="finalCtaTitulo" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Link de ubicacion
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.mapaLinkUrl} name="mapaLinkUrl" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          Texto final de reserva
          <textarea className="min-h-24 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.finalCtaTexto} name="finalCtaTexto" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Direccion visible
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.direccion} name="direccion" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70">
          Zona de atencion
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.zonaAtencion} name="zonaAtencion" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          Google Maps embed o link
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.mapaEmbedUrl} name="mapaEmbedUrl" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 lg:col-span-2">
          Facebook URL
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue={webContent.facebook} name="facebook" />
        </label>
        </WebEditSection>

        <button className="sticky bottom-4 z-10 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream shadow-xl shadow-black/10 disabled:opacity-60" disabled={!canEdit || saving === "web"} type="submit">
          <Save size={18} /> {saving === "web" ? "Guardando web..." : "Guardar contenido de la web"}
        </button>
      </form>
      ) : null}

      {activeTab === "configuracion" ? (
      <>
      <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft">
        <h2 className="font-display text-2xl font-extrabold text-teal">Estado de configuracion</h2>
        <p className="mt-2 text-sm font-semibold text-ink/60">Cada cambio importante del panel confirma si se guardo correctamente o si necesita revision.</p>
        <div className="mt-4" aria-live="polite">
          {saving ? <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/65">Guardando cambios...</p> : null}
          {message ? <p className="rounded-2xl bg-mint p-4 text-sm font-bold text-teal">Valido: {message}</p> : null}
          {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">Invalido: {error}</p> : null}
        </div>
      </section>
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
