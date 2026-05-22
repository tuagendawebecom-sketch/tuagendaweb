"use client";

import { AlertCircle, CalendarCheck, CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { PublicBookingData, PublicReservation } from "@/lib/firebase/reservations";
import type { PublicBusiness } from "@/types/tenant";

type PublicBookingFlowProps = Readonly<{
  business: PublicBusiness;
  bookingData: PublicBookingData;
  canReserve: boolean;
}>;

type ConfirmedReservation = {
  id: string;
  clienteNombre: string;
  servicioNombre: string;
  fecha: string;
  hora: string;
  personalNombre?: string;
  sucursalNombre?: string;
};

const errorMessages: Record<string, string> = {
  business_not_available: "Esta agenda no está disponible temporalmente.",
  firebase_not_configured: "La agenda todavía no está conectada. Escribí por WhatsApp para reservar.",
  service_not_found: "Elegí un servicio disponible.",
  staff_not_found: "Elegí una persona disponible.",
  branch_not_found: "Elegí una sucursal disponible.",
  invalid_customer: "Completá nombre y WhatsApp para confirmar.",
  date_not_available: "Ese día no está disponible.",
  time_not_available: "Ese horario ya no está disponible. Elegí otro.",
  phone_mismatch: "El teléfono no coincide con el turno.",
  reservation_not_found: "No encontramos ese turno.",
  already_cancelled: "Ese turno ya estaba cancelado."
};

function formatMoney(value?: number) {
  if (!value) return null;
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

function friendlyDate(value: string) {
  const date = new Date(`${value}T12:00:00.000Z`);
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function getErrorMessage(error?: string) {
  return error ? errorMessages[error] ?? "Algo no salió bien. Probá nuevamente." : "";
}

export function PublicBookingFlow({ business, bookingData, canReserve }: PublicBookingFlowProps) {
  const firstService = bookingData.services[0]?.id ?? "";
  const firstDate = bookingData.availableDates[0]?.value ?? "";
  const [serviceId, setServiceId] = useState(firstService);
  const [personalId, setPersonalId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [date, setDate] = useState(firstDate);
  const [time, setTime] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedReservation | null>(null);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [reservations, setReservations] = useState<PublicReservation[]>([]);

  const selectedService = useMemo(() => bookingData.services.find((service) => service.id === serviceId), [bookingData.services, serviceId]);
  const filteredStaff = useMemo(() => {
    const allowed = selectedService?.personalIds ?? [];
    if (!allowed.length) return bookingData.staff;
    return bookingData.staff.filter((person) => allowed.includes(person.id));
  }, [bookingData.staff, selectedService]);
  const filteredBranches = useMemo(() => {
    const allowed = selectedService?.sucursalIds ?? [];
    if (!allowed.length) return bookingData.branches;
    return bookingData.branches.filter((branch) => allowed.includes(branch.id));
  }, [bookingData.branches, selectedService]);
  const needsStaff = filteredStaff.length > 0;
  const needsBranch = filteredBranches.length > 0;
  const readyForTimes = canReserve && serviceId && date && (!needsStaff || personalId) && (!needsBranch || sucursalId);

  useEffect(() => {
    if (personalId && !filteredStaff.some((person) => person.id === personalId)) setPersonalId("");
    if (sucursalId && !filteredBranches.some((branch) => branch.id === sucursalId)) setSucursalId("");
  }, [filteredBranches, filteredStaff, personalId, sucursalId]);

  useEffect(() => {
    setTime("");
    setTimes([]);
    setError("");

    if (!readyForTimes) return;

    const controller = new AbortController();
    setLoadingTimes(true);
    fetch("/api/reservas/disponibilidad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: business.slug, serviceId, date, personalId, sucursalId }),
      signal: controller.signal
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error ?? "availability_failed");
        setTimes(data.times ?? []);
      })
      .catch((caughtError) => {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
        setError(getErrorMessage(caughtError instanceof Error ? caughtError.message : "availability_failed"));
      })
      .finally(() => setLoadingTimes(false));

    return () => controller.abort();
  }, [business.slug, date, personalId, readyForTimes, serviceId, sucursalId]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setConfirmed(null);

    if (!time) {
      setError("Elegí un horario disponible.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setBooking(true);
    try {
      const response = await fetch("/api/reservas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: business.slug,
          serviceId,
          date,
          time,
          personalId,
          sucursalId,
          clienteNombre: formData.get("clienteNombre"),
          telefono: formData.get("telefono")
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error ?? "reservation_failed");

      setConfirmed(data.reserva);
      setMessage("Turno confirmado. También podés consultarlo o cancelarlo con tu WhatsApp más abajo.");
      setTime("");
      setTimes((current) => current.filter((item) => item !== time));
      event.currentTarget.reset();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError instanceof Error ? caughtError.message : "reservation_failed"));
    } finally {
      setBooking(false);
    }
  }

  async function lookupReservations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupError("");
    setReservations([]);
    setLookupLoading(true);

    try {
      const response = await fetch("/api/reservas/consultar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: business.slug, telefono: lookupPhone })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error ?? "lookup_failed");
      setReservations(data.reservas ?? []);
      if (!data.reservas?.length) setLookupError("No encontramos turnos próximos con ese WhatsApp.");
    } catch (caughtError) {
      setLookupError(getErrorMessage(caughtError instanceof Error ? caughtError.message : "lookup_failed"));
    } finally {
      setLookupLoading(false);
    }
  }

  async function cancelPublicReservation(reservaId: string) {
    setLookupError("");
    try {
      const response = await fetch("/api/reservas/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: business.slug, reservaId, telefono: lookupPhone })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error ?? "cancel_failed");
      setReservations((current) => current.filter((reservation) => reservation.id !== reservaId));
      setMessage("Turno cancelado correctamente.");
    } catch (caughtError) {
      setLookupError(getErrorMessage(caughtError instanceof Error ? caughtError.message : "cancel_failed"));
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-ink/10 bg-paper p-5 shadow-soft sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-action">{business.nombre}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-teal">Reservá tu turno</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink/65">Elegí servicio, profesional o sucursal si corresponde, día y horario. Después confirmás con tu nombre y WhatsApp.</p>

        {!canReserve ? (
          <div className="mt-6 rounded-2xl bg-gold/20 p-4 font-semibold text-teal">
            Esta agenda no está disponible temporalmente. Podés contactar al negocio por WhatsApp.
          </div>
        ) : null}

        <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={submitBooking}>
          <div className="grid gap-7">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-teal">1. Elegí el servicio</h2>
              {bookingData.services.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {bookingData.services.map((service) => (
                    <button
                      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${serviceId === service.id ? "border-teal bg-mint shadow-soft" : "border-ink/10 bg-cream"}`}
                      disabled={!canReserve}
                      key={service.id}
                      onClick={() => {
                        setServiceId(service.id);
                        setPersonalId("");
                        setSucursalId("");
                      }}
                      type="button"
                    >
                      <p className="font-bold text-teal">{service.nombre}</p>
                      <p className="mt-1 text-sm text-ink/62">{service.duracionMin} min{formatMoney(service.precio) ? ` · ${formatMoney(service.precio)}` : ""}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-cream p-4 font-semibold text-ink/65">Todavía no hay servicios disponibles para reservar.</p>
              )}
            </div>

            {needsStaff ? (
              <div>
                <h2 className="font-display text-2xl font-extrabold text-teal">2. Elegí profesional</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {filteredStaff.map((person) => (
                    <button
                      className={`rounded-2xl border p-4 text-left transition ${personalId === person.id ? "border-teal bg-mint" : "border-ink/10 bg-cream"}`}
                      disabled={!canReserve}
                      key={person.id}
                      onClick={() => setPersonalId(person.id)}
                      type="button"
                    >
                      <p className="font-bold text-teal">{person.nombre}</p>
                      {person.especialidad ? <p className="mt-1 text-sm text-ink/60">{person.especialidad}</p> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {needsBranch ? (
              <div>
                <h2 className="font-display text-2xl font-extrabold text-teal">{needsStaff ? "3" : "2"}. Elegí sucursal</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {filteredBranches.map((branch) => (
                    <button
                      className={`rounded-2xl border p-4 text-left transition ${sucursalId === branch.id ? "border-teal bg-mint" : "border-ink/10 bg-cream"}`}
                      disabled={!canReserve}
                      key={branch.id}
                      onClick={() => setSucursalId(branch.id)}
                      type="button"
                    >
                      <p className="font-bold text-teal">{branch.nombre}</p>
                      {branch.direccion ? <p className="mt-1 text-sm text-ink/60">{branch.direccion}</p> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <h2 className="font-display text-2xl font-extrabold text-teal">{needsStaff && needsBranch ? "4" : needsStaff || needsBranch ? "3" : "2"}. Elegí día y horario</h2>
              <div className="mt-4 grid gap-4 rounded-2xl bg-cream p-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" aria-label="Calendario de días disponibles">
                  {bookingData.availableDates.map((item) => {
                    const [year, month, day] = item.value.split("-");
                    return (
                      <button
                        className={`rounded-2xl border px-3 py-3 text-left transition ${date === item.value ? "border-teal bg-teal text-cream" : "border-ink/10 bg-paper text-teal hover:border-teal/40"}`}
                        disabled={!canReserve}
                        key={item.value}
                        onClick={() => setDate(item.value)}
                        type="button"
                      >
                        <span className="block text-xs font-extrabold uppercase tracking-[0.08em] opacity-70">{item.dayName.slice(0, 3)}</span>
                        <span className="mt-1 block text-lg font-extrabold">{Number(day)}</span>
                        <span className="block text-xs font-bold opacity-70">{Number(month)}/{year.slice(2)}</span>
                      </button>
                    );
                  })}
                </div>

                {!readyForTimes ? <p className="rounded-xl bg-paper p-3 text-sm font-bold text-ink/60">Completá las opciones anteriores para ver horarios.</p> : null}
                {loadingTimes ? <p className="inline-flex items-center gap-2 rounded-xl bg-paper p-3 text-sm font-bold text-teal"><Loader2 className="animate-spin" size={16} /> Buscando horarios...</p> : null}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {times.map((item) => (
                    <button className={`rounded-xl border px-4 py-3 text-sm font-bold ${time === item ? "border-teal bg-teal text-cream" : "border-ink/10 bg-paper text-teal"}`} key={item} onClick={() => setTime(item)} type="button">
                      {item}
                    </button>
                  ))}
                </div>

                {readyForTimes && !loadingTimes && !times.length ? <p className="rounded-xl bg-paper p-3 text-sm font-bold text-ink/60">No hay horarios libres para esa selección.</p> : null}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-extrabold text-teal">{needsStaff && needsBranch ? "5" : needsStaff || needsBranch ? "4" : "3"}. Confirmá tus datos</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" disabled={!canReserve} name="clienteNombre" placeholder="Tu nombre" required />
                <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" disabled={!canReserve} inputMode="tel" name="telefono" placeholder="WhatsApp" required />
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[1.5rem] bg-teal p-5 text-cream lg:sticky lg:top-24">
            <CalendarCheck className="text-gold" size={28} />
            <h2 className="mt-4 font-display text-2xl font-extrabold">Resumen</h2>
            <div className="mt-5 grid gap-3 text-sm text-cream/82">
              <p><span className="font-bold text-cream">Servicio:</span> {selectedService?.nombre ?? "Pendiente"}</p>
              <p><span className="font-bold text-cream">Día:</span> {date ? friendlyDate(date) : "Pendiente"}</p>
              <p><span className="font-bold text-cream">Horario:</span> {time || "Pendiente"}</p>
              {personalId ? <p><span className="font-bold text-cream">Profesional:</span> {filteredStaff.find((item) => item.id === personalId)?.nombre}</p> : null}
              {sucursalId ? <p><span className="font-bold text-cream">Sucursal:</span> {filteredBranches.find((item) => item.id === sucursalId)?.nombre}</p> : null}
            </div>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-action px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={!canReserve || !bookingData.services.length || !time || booking} type="submit">
              {booking ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Confirmar turno
            </button>
          </aside>
        </form>

        <div className="mt-6" aria-live="polite">
          {error ? <p className="inline-flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700"><AlertCircle size={18} /> {error}</p> : null}
          {message ? <p className="inline-flex items-center gap-2 rounded-2xl bg-mint p-4 text-sm font-bold text-teal"><CheckCircle2 size={18} /> {message}</p> : null}
          {confirmed ? (
            <div className="mt-4 rounded-2xl border border-teal/20 bg-mint p-4 text-sm text-teal">
              <p className="font-extrabold">Turno confirmado para {confirmed.clienteNombre}</p>
              <p className="mt-1">{confirmed.servicioNombre} · {friendlyDate(confirmed.fecha)} · {confirmed.hora}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-ink/10 bg-paper p-5 shadow-soft sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-action">Consulta de turnos</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-teal">Ver o cancelar un turno</h2>
        <p className="mt-3 max-w-2xl leading-7 text-ink/65">Ingresá el WhatsApp que usaste para reservar. Vas a ver tus próximos turnos y podés cancelarlos si ya no vas a asistir.</p>
        <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={lookupReservations}>
          <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" inputMode="tel" onChange={(event) => setLookupPhone(event.target.value)} placeholder="WhatsApp usado en la reserva" required value={lookupPhone} />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream disabled:opacity-60" disabled={lookupLoading} type="submit">
            {lookupLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} Buscar
          </button>
        </form>

        {lookupError ? <p className="mt-4 rounded-2xl bg-gold/20 p-4 text-sm font-bold text-teal">{lookupError}</p> : null}
        <div className="mt-5 grid gap-3">
          {reservations.map((reservation) => (
            <article className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={reservation.id}>
              <div>
                <p className="font-extrabold text-teal">{reservation.servicioNombre}</p>
                <p className="mt-1 text-sm text-ink/65">{friendlyDate(reservation.fecha)} · {reservation.hora}{reservation.personalNombre ? ` · ${reservation.personalNombre}` : ""}{reservation.sucursalNombre ? ` · ${reservation.sucursalNombre}` : ""}</p>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" onClick={() => cancelPublicReservation(reservation.id)} type="button">
                <XCircle size={16} /> Cancelar
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
