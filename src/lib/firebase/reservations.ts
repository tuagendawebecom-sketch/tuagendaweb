import { FieldValue } from "firebase-admin/firestore";
import { canReserveBusiness, getBusinessBySlug, getPublicBranches, getPublicScheduleConfig, getPublicServices, getPublicStaff } from "@/lib/firebase/business";
import { getAdminDb } from "@/lib/firebase/admin";
import { normalizePhone } from "@/lib/phone";
import { isValidSlug } from "@/lib/slug";
import type { PublicBranch, PublicScheduleConfig, PublicService, PublicStaff } from "@/types/tenant";

const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const inputDayAliases: Record<string, string> = {
  miercoles: "miércoles",
  sabado: "sábado"
};

export type PublicBookingData = {
  services: PublicService[];
  staff: PublicStaff[];
  branches: PublicBranch[];
  schedule: PublicScheduleConfig;
  availableDates: Array<{ value: string; label: string; dayName: string }>;
};

export type PublicReservation = {
  id: string;
  clienteNombre: string;
  telefono: string;
  servicioId: string;
  servicioNombre: string;
  duracionMin: number;
  precio?: number;
  fecha: string;
  hora: string;
  fechaHora: string;
  estado: string;
  personalId?: string;
  personalNombre?: string;
  sucursalId?: string;
  sucursalNombre?: string;
};

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function timeFromMinutes(total: number) {
  const hours = Math.floor(total / 60).toString().padStart(2, "0");
  const minutes = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function todayInArgentina() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date());
}

function nowMinutesInArgentina() {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return minutesFromTime(formatter.format(new Date()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function localDateFromISO(date: string) {
  return new Date(`${date}T12:00:00.000Z`);
}

function normalizeDayName(day: string) {
  const normalized = day.trim().toLowerCase();
  return inputDayAliases[normalized] ?? normalized;
}

function staffWorksAtBranch(person: PublicStaff | undefined, sucursalId?: string) {
  if (!person || !sucursalId) return true;
  const allowedBranches = person.sucursalIds ?? [];
  return !allowedBranches.length || allowedBranches.includes(sucursalId);
}

function isBusinessDay(date: string, schedule: PublicScheduleConfig) {
  const current = localDateFromISO(date);
  const dayName = dayNames[current.getUTCDay()];
  const daySchedule = schedule.horariosPorDia?.[dayName];
  if (daySchedule) return daySchedule.activo && daySchedule.rangos.length > 0;

  const allowed = new Set(schedule.diasAtencion.map(normalizeDayName));
  return allowed.has(dayName);
}

function getRangesForDate(date: string, schedule: PublicScheduleConfig) {
  const current = localDateFromISO(date);
  const daySchedule = schedule.horariosPorDia?.[dayNames[current.getUTCDay()]];
  if (daySchedule?.activo && daySchedule.rangos.length) return daySchedule.rangos;
  if (!daySchedule && isBusinessDay(date, schedule)) return [{ inicio: schedule.horarioInicio, fin: schedule.horarioFin }];
  return [];
}

function isWithinReservableRange(date: string, schedule: PublicScheduleConfig) {
  const today = todayInArgentina();
  const maxDate = isoDate(addDays(localDateFromISO(today), schedule.diasReservaMax - 1));
  return date >= today && date <= maxDate;
}

function slotDocId(input: { date: string; time: string; personalId?: string; sucursalId?: string }) {
  const staff = input.personalId || "sin-personal";
  const branch = input.sucursalId || "sin-sucursal";
  return `${input.date}_${input.time.replace(":", "")}_${staff}_${branch}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function getSlotIdsForDuration(input: {
  date: string;
  time: string;
  durationMin: number;
  intervalMin: number;
  personalId?: string;
  sucursalId?: string;
}) {
  const blocks = Math.max(1, Math.ceil(input.durationMin / input.intervalMin));
  const start = minutesFromTime(input.time);

  return Array.from({ length: blocks }, (_, index) =>
    slotDocId({
      date: input.date,
      time: timeFromMinutes(start + index * input.intervalMin),
      personalId: input.personalId,
      sucursalId: input.sucursalId
    })
  );
}

function serializeReservation(id: string, data: FirebaseFirestore.DocumentData): PublicReservation {
  return {
    id,
    clienteNombre: data.clienteNombre ?? "Cliente",
    telefono: data.telefono ?? "",
    servicioId: data.servicioId ?? "",
    servicioNombre: data.servicioNombre ?? "Servicio",
    duracionMin: Number(data.duracionMin ?? 30),
    precio: Number.isFinite(Number(data.precio)) ? Number(data.precio) : undefined,
    fecha: data.fecha ?? "",
    hora: data.hora ?? "",
    fechaHora: data.fechaHora ?? `${data.fecha ?? ""}T${data.hora ?? "00:00"}:00`,
    estado: data.estado ?? "confirmada",
    personalId: data.personalId,
    personalNombre: data.personalNombre,
    sucursalId: data.sucursalId,
    sucursalNombre: data.sucursalNombre
  };
}

export async function getPublicBookingData(negocioId: string): Promise<PublicBookingData> {
  const [services, staff, branches, schedule] = await Promise.all([
    getPublicServices(negocioId),
    getPublicStaff(negocioId),
    getPublicBranches(negocioId),
    getPublicScheduleConfig(negocioId)
  ]);

  const start = localDateFromISO(todayInArgentina());
  const availableDates = Array.from({ length: schedule.diasReservaMax }, (_, index) => {
    const date = addDays(start, index);
    const value = isoDate(date);
    const dayName = dayNames[date.getUTCDay()];
    return { value, dayName, label: `${dayName.charAt(0).toUpperCase()}${dayName.slice(1)} ${date.getUTCDate()}/${date.getUTCMonth() + 1}` };
  }).filter((item) => isBusinessDay(item.value, schedule));

  return { services, staff, branches, schedule, availableDates };
}

export async function getAvailableTimes(input: {
  slug: string;
  serviceId: string;
  date: string;
  personalId?: string;
  sucursalId?: string;
}) {
  if (!isValidSlug(input.slug)) return { ok: false as const, error: "invalid_slug" };

  const business = await getBusinessBySlug(input.slug);
  if (!business) return { ok: false as const, error: "business_not_found" };
  if (!canReserveBusiness(business)) return { ok: false as const, error: "business_not_available" };

  const db = getAdminDb();
  if (!db) return { ok: false as const, error: "firebase_not_configured" };

  const [services, staff, schedule] = await Promise.all([getPublicServices(business.id), getPublicStaff(business.id), getPublicScheduleConfig(business.id)]);
  const service = services.find((item) => item.id === input.serviceId && item.activo !== false);
  const person = input.personalId ? staff.find((item) => item.id === input.personalId && item.activo !== false) : undefined;
  if (!service) return { ok: false as const, error: "service_not_found" };
  if (service.personalIds?.length && !input.personalId) return { ok: false as const, error: "staff_not_found" };
  if (service.personalIds?.length && input.personalId && !service.personalIds.includes(input.personalId)) return { ok: false as const, error: "staff_not_found" };
  if (service.sucursalIds?.length && !input.sucursalId) return { ok: false as const, error: "branch_not_found" };
  if (service.sucursalIds?.length && input.sucursalId && !service.sucursalIds.includes(input.sucursalId)) return { ok: false as const, error: "branch_not_found" };
  if (input.personalId && !person) return { ok: false as const, error: "staff_not_found" };
  if (!staffWorksAtBranch(person, input.sucursalId)) return { ok: false as const, error: "staff_branch_mismatch" };
  if (!isWithinReservableRange(input.date, schedule)) return { ok: true as const, times: [] };
  if (!isBusinessDay(input.date, schedule)) return { ok: true as const, times: [] };

  const occupiedSnapshot = await db.collection("negocios").doc(business.id).collection("horariosOcupados").where("fecha", "==", input.date).get();
  const occupied = new Set(occupiedSnapshot.docs.map((doc) => doc.id));
  const today = todayInArgentina();
  const earliestToday = nowMinutesInArgentina() + schedule.anticipacionHoras * 60;
  const ranges = getRangesForDate(input.date, schedule);
  const times: string[] = [];

  for (const range of ranges) {
    const start = minutesFromTime(range.inicio);
    const end = minutesFromTime(range.fin);
    const lastStart = end - Math.max(service.duracionMin, schedule.intervaloMin);

    for (let minute = start; minute <= lastStart; minute += schedule.intervaloMin) {
      if (input.date === today && minute < earliestToday) continue;

      const time = timeFromMinutes(minute);
      const slotIds = getSlotIdsForDuration({
        date: input.date,
        time,
        durationMin: service.duracionMin,
        intervalMin: schedule.intervaloMin,
        personalId: input.personalId,
        sucursalId: input.sucursalId
      });

      if (slotIds.every((slotId) => !occupied.has(slotId))) times.push(time);
    }
  }

  return { ok: true as const, times };
}

export async function createReservation(input: {
  slug: string;
  serviceId: string;
  date: string;
  time: string;
  clienteNombre: string;
  telefono: string;
  personalId?: string;
  sucursalId?: string;
}) {
  if (!isValidSlug(input.slug)) return { ok: false as const, error: "invalid_slug" };

  const business = await getBusinessBySlug(input.slug);
  if (!business) return { ok: false as const, error: "business_not_found" };
  if (!canReserveBusiness(business)) return { ok: false as const, error: "business_not_available" };

  const db = getAdminDb();
  if (!db) return { ok: false as const, error: "firebase_not_configured" };

  const [services, staff, branches, schedule] = await Promise.all([
    getPublicServices(business.id),
    getPublicStaff(business.id),
    getPublicBranches(business.id),
    getPublicScheduleConfig(business.id)
  ]);
  const service = services.find((item) => item.id === input.serviceId && item.activo !== false);
  const person = input.personalId ? staff.find((item) => item.id === input.personalId && item.activo !== false) : undefined;
  const branch = input.sucursalId ? branches.find((item) => item.id === input.sucursalId && item.activo !== false) : undefined;
  const telefonoNormalizado = normalizePhone(input.telefono);

  if (!service) return { ok: false as const, error: "service_not_found" };
  if (service.personalIds?.length && !input.personalId) return { ok: false as const, error: "staff_not_found" };
  if (service.personalIds?.length && input.personalId && !service.personalIds.includes(input.personalId)) return { ok: false as const, error: "staff_not_found" };
  if (service.sucursalIds?.length && !input.sucursalId) return { ok: false as const, error: "branch_not_found" };
  if (service.sucursalIds?.length && input.sucursalId && !service.sucursalIds.includes(input.sucursalId)) return { ok: false as const, error: "branch_not_found" };
  if (input.personalId && !person) return { ok: false as const, error: "staff_not_found" };
  if (input.sucursalId && !branch) return { ok: false as const, error: "branch_not_found" };
  if (!staffWorksAtBranch(person, input.sucursalId)) return { ok: false as const, error: "staff_branch_mismatch" };
  if (input.clienteNombre.trim().length < 2 || telefonoNormalizado.length < 10) return { ok: false as const, error: "invalid_customer" };
  if (!isWithinReservableRange(input.date, schedule)) return { ok: false as const, error: "date_not_available" };
  if (!isBusinessDay(input.date, schedule)) return { ok: false as const, error: "date_not_available" };

  const available = await getAvailableTimes({
    slug: input.slug,
    serviceId: input.serviceId,
    date: input.date,
    personalId: input.personalId,
    sucursalId: input.sucursalId
  });
  if (!available.ok || !available.times.includes(input.time)) return { ok: false as const, error: "time_not_available" };

  const negocioRef = db.collection("negocios").doc(business.id);
  const reservaRef = negocioRef.collection("reservas").doc();
  const slotIds = getSlotIdsForDuration({
    date: input.date,
    time: input.time,
    durationMin: service.duracionMin,
    intervalMin: schedule.intervaloMin,
    personalId: input.personalId,
    sucursalId: input.sucursalId
  });
  const slotRefs = slotIds.map((slotId) => negocioRef.collection("horariosOcupados").doc(slotId));

  await db.runTransaction(async (transaction) => {
    const slotDocs = await Promise.all(slotRefs.map((slotRef) => transaction.get(slotRef)));
    if (slotDocs.some((slotDoc) => slotDoc.exists)) {
      throw new Error("time_not_available");
    }

    transaction.set(reservaRef, {
      clienteNombre: input.clienteNombre.trim(),
      telefono: input.telefono.trim(),
      telefonoNormalizado,
      servicioId: service.id,
      servicioNombre: service.nombre,
      duracionMin: service.duracionMin,
      precio: service.precio ?? null,
      fecha: input.date,
      hora: input.time,
      fechaHora: `${input.date}T${input.time}:00`,
      estado: "confirmada",
      personalId: person?.id ?? null,
      personalNombre: person?.nombre ?? null,
      sucursalId: branch?.id ?? null,
      sucursalNombre: branch?.nombre ?? null,
      horarioOcupadoIds: slotIds,
      source: "public_agenda",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    slotRefs.forEach((slotRef) => {
      transaction.set(slotRef, {
        reservaId: reservaRef.id,
        fecha: input.date,
        hora: input.time,
        personalId: person?.id ?? null,
        sucursalId: branch?.id ?? null,
        createdAt: FieldValue.serverTimestamp()
      });
    });
  });

  return {
    ok: true as const,
    reserva: {
      id: reservaRef.id,
      clienteNombre: input.clienteNombre.trim(),
      servicioNombre: service.nombre,
      fecha: input.date,
      hora: input.time,
      personalNombre: person?.nombre,
      sucursalNombre: branch?.nombre
    }
  };
}

export async function findReservationsByPhone(input: { slug: string; telefono: string }) {
  if (!isValidSlug(input.slug)) return { ok: false as const, error: "invalid_slug" };

  const business = await getBusinessBySlug(input.slug);
  if (!business) return { ok: false as const, error: "business_not_found" };

  const db = getAdminDb();
  if (!db) return { ok: false as const, error: "firebase_not_configured" };

  const telefonoNormalizado = normalizePhone(input.telefono);
  if (telefonoNormalizado.length < 10) return { ok: false as const, error: "invalid_phone" };

  const snapshot = await db
    .collection("negocios")
    .doc(business.id)
    .collection("reservas")
    .where("telefonoNormalizado", "==", telefonoNormalizado)
    .limit(30)
    .get();

  const today = todayInArgentina();
  const reservas = snapshot.docs
    .map((doc) => serializeReservation(doc.id, doc.data()))
    .filter((reserva) => reserva.estado !== "cancelada" && reserva.fecha >= today)
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));

  return { ok: true as const, reservas };
}

export async function cancelReservation(input: { slug: string; reservaId: string; telefono: string }) {
  if (!isValidSlug(input.slug)) return { ok: false as const, error: "invalid_slug" };

  const business = await getBusinessBySlug(input.slug);
  if (!business) return { ok: false as const, error: "business_not_found" };

  const db = getAdminDb();
  if (!db) return { ok: false as const, error: "firebase_not_configured" };

  const telefonoNormalizado = normalizePhone(input.telefono);
  const negocioRef = db.collection("negocios").doc(business.id);
  const reservaRef = negocioRef.collection("reservas").doc(input.reservaId);

  await db.runTransaction(async (transaction) => {
    const reservaDoc = await transaction.get(reservaRef);
    if (!reservaDoc.exists) throw new Error("reservation_not_found");

    const data = reservaDoc.data() ?? {};
    if (data.telefonoNormalizado !== telefonoNormalizado) throw new Error("phone_mismatch");
    if (data.estado === "cancelada") throw new Error("already_cancelled");

    transaction.update(reservaRef, {
      estado: "cancelada",
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    const slotIds = Array.isArray(data.horarioOcupadoIds) ? data.horarioOcupadoIds.map(String) : [];
    const fallbackSlot = data.horarioOcupadoId ?? data.bloqueoId;
    const allSlotIds = fallbackSlot ? [...slotIds, String(fallbackSlot)] : slotIds;
    allSlotIds.forEach((slotId) => transaction.delete(negocioRef.collection("horariosOcupados").doc(slotId)));
  });

  return { ok: true as const };
}
