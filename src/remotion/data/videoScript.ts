export const fps = 30;

export const brand = {
  green: "#123D3A",
  action: "#1F8A78",
  warm: "#F7F4EE",
  text: "#1E1E1C",
  accent: "#E7B85A",
  mint: "#DDEBE6",
  paper: "#FCF9F5",
  muted: "#5E6966"
};

export const sceneDurations = {
  hook: 4,
  solution: 4,
  booking: 6,
  admin: 6,
  demos: 5,
  price: 5,
  cta: 5
};

export const landingDurationSeconds = Object.values(sceneDurations).reduce((total, seconds) => total + seconds, 0);
export const verticalDurationSeconds = 28;

export const videoCopy = {
  hook: {
    title: "¿Seguís organizando todos tus turnos por WhatsApp?",
    subtitle: "Responder tarde puede costarte reservas.",
    bubbles: ["¿Tenés turno?", "¿Qué horarios tenés?", "¿Cuánto sale?", "¿Me agendás para mañana?", "¿Seguís atendiendo?"]
  },
  solution: {
    title: "TuAgendaWeb ordena tu agenda.",
    subtitle: "Web propia + reservas online + panel administrativo."
  },
  booking: {
    title: "Tus clientes reservan desde el celular.",
    steps: ["Elegí servicio", "Elegí día y horario", "Confirmá tu turno"],
    service: "Corte + Barba",
    time: "Martes 15:00 hs",
    confirmed: "Turno confirmado"
  },
  admin: {
    title: "Vos administrás todo desde un panel simple.",
    subtitle: "Turnos, clientes, servicios, personal y datos básicos del negocio.",
    cards: ["Turnos de hoy", "Clientes", "Servicios", "Personal", "Resumen del negocio"]
  },
  demos: {
    title: "Se adapta a distintos rubros.",
    subtitle: "Tu negocio puede tener una experiencia de reserva clara y profesional.",
    categories: [
      { name: "Barbería", label: "Turnos para cortes, barba y combos." },
      { name: "Estética", label: "Tratamientos con agenda ordenada." },
      { name: "Canchas", label: "Reservas por horario." },
      { name: "Médicos", label: "Consultas con turnos claros." },
      { name: "Peluquería", label: "Servicios, duración y profesionales." },
      { name: "Uñas", label: "Agenda visual y simple." }
    ]
  },
  pricing: {
    title: "Desde $100.000",
    subtitle: "Pago único inicial",
    bullets: ["Dominio incluido", "Landing personalizada", "Página de reserva", "Panel administrativo", "Sin mantenimiento mensual al inicio"]
  },
  cta: {
    title: "Mostrame tu negocio y te digo cómo podría quedar tu web con turnos online.",
    button: "Solicitar demo por WhatsApp",
    brand: "TuAgendaWeb"
  }
};
