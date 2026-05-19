import {
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Database,
  Globe2,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Scissors,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  WandSparkles
} from "lucide-react";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tuagendaweb.com.ar";
export const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
export const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL ?? "tuagendaweb.ecom@gmail.com";

export const brandAssets = {
  logo: "/brand/logo-tuagendaweb.png"
};

export const trackingEvents = {
  whatsappClick: "whatsapp_click",
  demoClick: "demo_click",
  pricingCtaClick: "pricing_cta_click",
  finalCtaClick: "final_cta_click",
  emailFormSubmit: "email_form_submit"
} as const;

export const whatsappMessages = {
  heroAgenda: "Hola, quiero consultar por Agenda Simple para recibir turnos online desde un link.",
  heroWeb: "Hola, quiero consultar por la Web Completa con sistema de turnos.",
  agendaSimple: "Hola, quiero consultar por Agenda Simple para recibir turnos online desde un link.",
  agendaPro: "Hola, quiero consultar por Agenda Pro para mi negocio.",
  webCompleta: "Hola, quiero consultar por la Web Completa con sistema de turnos.",
  pricing: "Hola, quiero consultar por los planes de TuAgendaWeb.",
  final: "Hola, quiero empezar a recibir turnos online con TuAgendaWeb.",
  demo: (category: string) => `Hola, vi la demo de TuAgendaWeb para ${category} y quiero saber cómo podría quedar para mi negocio.`
};

export const socialLinks = {
  whatsapp: whatsappPhone ? `https://wa.me/${whatsappPhone}` : "#",
  instagram: "https://www.instagram.com/tuagendaweb/",
  facebook: "https://www.facebook.com/TuAgendaWeb.ecom",
  email: `mailto:${brandEmail}`
};

export const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Agenda Simple", href: "#agenda-simple" },
  { label: "Agenda Pro", href: "#planes" },
  { label: "Web Completa", href: "#web-completa" },
  { label: "Demos", href: "#demos" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" }
];

export const hero = {
  eyebrow: "Turnos online para negocios locales",
  title: "Turnos online para tu negocio, con o sin web propia.",
  subtitle:
    "Elegí entre una agenda simple para recibir turnos desde un link, o una web completa con dominio, landing personalizada y panel de administración.",
  support:
    "Para negocios que trabajan con turnos en Tucumán y quieren ordenar su agenda sin depender de coordinar todo por WhatsApp.",
  price: "Agenda desde $15.000/mes",
  primaryCta: "Quiero una agenda online",
  secondaryCta: "Quiero una web completa"
};

export const plans = [
  {
    id: "agenda_simple",
    name: "Agenda Simple",
    price: "Desde $15.000 / mes",
    description: "Un link de reservas para que tus clientes elijan servicio, día y horario desde el celular.",
    cta: "Consultar Agenda Simple",
    message: whatsappMessages.agendaSimple,
    href: "#agenda-simple",
    featured: false,
    note: "Ideal para empezar rápido sin web completa.",
    features: [
      "Link público dentro de TuAgendaWeb",
      "Servicios, horarios y personal si aplica",
      "Reserva desde celular",
      "Panel básico para el dueño",
      "Activación o suspensión manual desde Super Admin"
    ]
  },
  {
    id: "agenda_pro",
    name: "Agenda Pro",
    price: "Desde $30.000 / mes",
    description: "Sistema de turnos online con funciones extra para negocios que quieren automatizar más.",
    cta: "Consultar Agenda Pro",
    message: whatsappMessages.agendaPro,
    href: "#planes",
    featured: false,
    note: "Funciones extra sujetas a disponibilidad según implementación.",
    features: [
      "Todo lo de Agenda Simple",
      "Panel con módulos extra preparados",
      "Recordatorios y reportes marcados como próximos si no están activos",
      "Mejoras mensuales según alcance definido"
    ]
  },
  {
    id: "web_completa",
    name: "Web Completa",
    price: "$100.000 pago único",
    description: "Tu propia web con dominio, landing personalizada, sistema de turnos y panel administrativo.",
    cta: "Consultar Web Completa",
    message: whatsappMessages.webCompleta,
    href: "#web-completa",
    featured: true,
    note: "La opción más profesional para vender con marca propia.",
    features: [
      "Dominio propio",
      "Landing personalizada",
      "Página de reserva",
      "Panel administrativo",
      "Identidad visual, WhatsApp, redes y Google Maps"
    ]
  }
];

export const quickExplanation = [
  {
    title: "Agenda online mensual",
    text: "Un link dentro de TuAgendaWeb para negocios que quieren ordenar reservas sin construir una web completa.",
    icon: CalendarCheck
  },
  {
    title: "Reserva desde celular",
    text: "Tus clientes eligen servicio, día y horario sin esperar mensajes de ida y vuelta.",
    icon: Smartphone,
    featured: true
  },
  {
    title: "Web completa con panel",
    text: "Dominio propio, landing personalizada y administración de turnos, servicios, clientes y personal.",
    icon: LayoutDashboard
  }
];

export const problemSolution = {
  before: [
    "Mensajes repetidos para coordinar horarios",
    "Clientes esperando respuesta",
    "Turnos anotados en distintos lugares",
    "Riesgo de horarios duplicados",
    "Falta de imagen profesional",
    "Pérdida de reservas cuando estás ocupado"
  ],
  after: [
    "Un link claro para reservar desde el celular",
    "Turnos ordenados por fecha, servicio y cliente",
    "Panel para administrar sin depender de planillas",
    "Agenda activa o suspendida manualmente según estado del negocio",
    "Imagen más profesional sin dejar de usar WhatsApp"
  ]
};

export const howItWorks = [
  {
    title: "Tu cliente entra al link",
    text: "Puede ser un link dentro de TuAgendaWeb o una web propia con dominio del negocio.",
    icon: MessageCircle
  },
  {
    title: "Elige servicio, día y horario",
    text: "Reserva desde el celular con una experiencia clara, rápida y pensada para cada rubro.",
    icon: CalendarCheck
  },
  {
    title: "Vos administrás desde el panel",
    text: "Ves turnos, editás servicios, ordenás clientes, configurás personal y revisás datos básicos del negocio.",
    icon: Settings2
  }
];

export type DemoCategory = {
  slug: string;
  category: string;
  title: string;
  headline: string;
  description: string;
  commercialDescription: string;
  services: string[];
  benefits: string[];
  palette: string;
  cover: string;
  desktop: string;
  mobile: string;
  cta: string;
};

export const demoCategories: DemoCategory[] = [
  {
    slug: "barberia",
    category: "barbería",
    title: "Barberías",
    headline: "Una agenda clara para cortes, barba y clientes recurrentes.",
    description: "Mostrá estilos, servicios, barberos y horarios disponibles para que cada cliente reserve sin esperar respuesta.",
    commercialDescription: "Turnos para cortes, barba y combos con una experiencia rápida desde el celular.",
    services: ["Corte clásico - 45 min", "Corte + barba - 60 min", "Perfilado de barba - 30 min", "Color o diseño - 90 min"],
    benefits: ["Menos mensajes mientras atendés", "Mejor organización por barbero", "Clientes recurrentes más fáciles de gestionar"],
    palette: "from-teal-900 to-emerald-700",
    cover: "/assets/demos/barberia-cover.png",
    desktop: "/assets/demos/barberia-desktop.png",
    mobile: "/assets/demos/barberia-mobile.png",
    cta: "Consultar para barbería"
  },
  {
    slug: "estetica",
    category: "estética",
    title: "Estética",
    headline: "Una web elegante para tratamientos, cabinas y reservas por servicio.",
    description: "Ordená tratamientos, duraciones, profesionales y disponibilidad con una experiencia cuidada y visual.",
    commercialDescription: "Ideal para estudios de estética que venden confianza, imagen y organización.",
    services: ["Limpieza facial - 60 min", "Depilación - 45 min", "Tratamiento corporal - 75 min", "Consulta estética - 30 min"],
    benefits: ["Servicios claros antes de consultar", "Agenda por profesional o cabina", "Imagen premium para campañas"],
    palette: "from-rose-700 to-teal-700",
    cover: "/assets/demos/estetica-cover.png",
    desktop: "/assets/demos/estetica-desktop.png",
    mobile: "/assets/demos/estetica-mobile.png",
    cta: "Consultar para estética"
  },
  {
    slug: "canchas",
    category: "canchas",
    title: "Canchas",
    headline: "Reservas ordenadas por cancha, horario y tipo de turno.",
    description: "Mostrá disponibilidad, ubicación, tipos de cancha y horarios para que los grupos reserven más rápido.",
    commercialDescription: "Reservas simples para fútbol, pádel u otros espacios con horarios visibles.",
    services: ["Cancha fútbol 5 - 60 min", "Cancha fútbol 7 - 60 min", "Turno nocturno - 90 min", "Reserva fija semanal"],
    benefits: ["Menos coordinación entre grupos", "Horarios disponibles siempre visibles", "Mejor control de reservas fijas"],
    palette: "from-lime-800 to-teal-800",
    cover: "/assets/demos/canchas-cover.png",
    desktop: "/assets/demos/canchas-desktop.png",
    mobile: "/assets/demos/canchas-mobile.png",
    cta: "Consultar para canchas"
  },
  {
    slug: "medicos",
    category: "médicos",
    title: "Consultorios",
    headline: "Una agenda profesional para consultorios y pacientes.",
    description: "Organizá consultas, especialidades, horarios de atención y datos de contacto con una presencia clara.",
    commercialDescription: "Una reserva simple y profesional para consultorios y profesionales de salud.",
    services: ["Consulta inicial - 40 min", "Control - 30 min", "Teleconsulta - 30 min", "Estudio o práctica - 60 min"],
    benefits: ["Menos llamadas administrativas", "Pacientes con información clara", "Agenda organizada por profesional"],
    palette: "from-sky-800 to-teal-800",
    cover: "/assets/demos/medicos-cover.png",
    desktop: "/assets/demos/medicos-desktop.png",
    mobile: "/assets/demos/medicos-mobile.png",
    cta: "Consultar para consultorio"
  },
  {
    slug: "peluqueria",
    category: "peluquería",
    title: "Peluquerías",
    headline: "Servicios, estilistas y horarios sin mensajes interminables.",
    description: "Presentá cortes, color, tratamientos y profesionales para que cada clienta reserve con seguridad.",
    commercialDescription: "Una agenda visual para peluquerías que necesitan ordenar servicios y tiempos.",
    services: ["Corte y brushing - 60 min", "Coloración - 120 min", "Tratamiento capilar - 75 min", "Peinado evento - 90 min"],
    benefits: ["Duraciones claras por servicio", "Mejor planificación del equipo", "Más confianza antes de reservar"],
    palette: "from-amber-700 to-teal-800",
    cover: "/assets/demos/peluqueria-cover.png",
    desktop: "/assets/demos/peluqueria-desktop.png",
    mobile: "/assets/demos/peluqueria-mobile.png",
    cta: "Consultar para peluquería"
  },
  {
    slug: "unas",
    category: "uñas",
    title: "Uñas",
    headline: "Turnos prolijos para esmaltado, kapping, soft gel y nail art.",
    description: "Mostrá trabajos, duraciones, servicios y horarios para que cada clienta elija sin confusiones.",
    commercialDescription: "Perfecta para nail artists que necesitan ordenar agenda y mostrar opciones.",
    services: ["Esmaltado semi - 60 min", "Kapping gel - 90 min", "Soft gel - 120 min", "Nail art adicional - 30 min"],
    benefits: ["Menos dudas sobre precios y tiempos", "Agenda más ordenada por técnica", "Presentación visual del servicio"],
    palette: "from-pink-700 to-teal-700",
    cover: "/assets/demos/unas-cover.png",
    desktop: "/assets/demos/unas-desktop.png",
    mobile: "/assets/demos/unas-mobile.png",
    cta: "Consultar para uñas"
  },
  {
    slug: "tatuajes",
    category: "tatuajes",
    title: "Tatuadores",
    headline: "Consultas, sesiones y disponibilidad con una imagen fuerte.",
    description: "Mostrá portfolio, estilos, turnos de consulta y sesiones para convertir interés en conversaciones concretas.",
    commercialDescription: "Una demo pensada para estudios que necesitan portfolio, consulta y agenda.",
    services: ["Consulta de diseño - 30 min", "Sesión chica - 90 min", "Sesión media - 180 min", "Retoque - 60 min"],
    benefits: ["Mejor filtro antes del WhatsApp", "Portfolio y agenda en el mismo link", "Más claridad para señas futuras"],
    palette: "from-zinc-900 to-teal-900",
    cover: "/assets/demos/tatuajes-cover.png",
    desktop: "/assets/demos/tatuajes-desktop.png",
    mobile: "/assets/demos/tatuajes-mobile.png",
    cta: "Consultar para tatuajes"
  },
  {
    slug: "masajes",
    category: "masajes",
    title: "Masajistas",
    headline: "Reservas tranquilas para sesiones, terapias y horarios disponibles.",
    description: "Comunicá tipos de masaje, duración, ubicación y disponibilidad con una experiencia cálida y simple.",
    commercialDescription: "Agenda clara para terapeutas y centros que venden confianza y bienestar.",
    services: ["Masaje descontracturante - 60 min", "Masaje relajante - 60 min", "Drenaje linfático - 75 min", "Sesión terapéutica - 90 min"],
    benefits: ["Menos interrupciones durante sesiones", "Servicios entendibles antes de reservar", "Experiencia calmada desde el primer contacto"],
    palette: "from-stone-700 to-teal-800",
    cover: "/assets/demos/masajes-cover.png",
    desktop: "/assets/demos/masajes-desktop.png",
    mobile: "/assets/demos/masajes-mobile.png",
    cta: "Consultar para masajes"
  }
];

export const agendaSimpleFeatures = [
  "Nombre del negocio, logo o iniciales",
  "Link público: tuagendaweb.com.ar/agenda/victorias-estetica",
  "Servicios, horarios, personal y sucursales si aplica",
  "Reserva desde celular",
  "Consulta y cancelación por celular cuando la lógica migrada esté activa",
  "Panel básico para el dueño",
  "Estado activo o suspendido manejado manualmente"
];

export const webCompletaFeatures = [
  "Dominio propio",
  "Landing personalizada",
  "Reserva online",
  "Panel administrativo",
  "Identidad visual",
  "WhatsApp, redes y Google Maps",
  "Servicios, personal y clientes",
  "Configuración editable"
];

export const comparisonRows = [
  ["Link dentro de TuAgendaWeb", "Sí", "Sí", "No, usa dominio propio"],
  ["Reserva online", "Sí", "Sí", "Sí"],
  ["Panel de administración", "Básico", "Con módulos extra preparados", "Completo"],
  ["Pago", "Mensual", "Mensual", "Pago único"],
  ["Dominio propio", "No", "No", "Sí"],
  ["Landing personalizada", "No", "Limitada", "Sí"]
] as const;

export const extras = {
  available: [
    ["Secciones visuales extra", Sparkles],
    ["Configuración editable", Settings2],
    ["Gestión de servicios", CalendarClock],
    ["Personal y sucursales", Users]
  ],
  upcoming: [
    ["Recordatorios por WhatsApp", MessageCircle],
    ["Reportes avanzados", BarChart3],
    ["Seguimiento de clientes", HeartHandshake],
    ["Agenda avanzada por profesional", Users]
  ],
  quoted: [
    ["Seña o pago online", CreditCard],
    ["Automatizaciones avanzadas", Settings2],
    ["Exportaciones especiales", Database],
    ["Webs con dominio personalizado", Globe2]
  ]
} as const;

export const includedFeatures = [
  ["Dominio incluido", Globe2],
  ["Landing personalizada", WandSparkles],
  ["Página de reserva", CalendarClock],
  ["Panel de administración", LayoutDashboard],
  ["Base de clientes", Database],
  ["Gestión de turnos", CalendarCheck],
  ["Gestión de servicios", Settings2],
  ["Gestión de personal", Users],
  ["Dashboard básico", BarChart3],
  ["WhatsApp, maps y redes", MapPin],
  ["Imágenes iniciales", Sparkles],
  ["Reunión final de revisión", HeartHandshake]
] as const;

export const benefits = [
  ["Más turnos organizados", CalendarCheck],
  ["Menos coordinación manual", MessageCircle],
  ["Imagen más profesional", ShieldCheck],
  ["Reservas desde el celular", Smartphone],
  ["Panel simple de gestión", LayoutDashboard],
  ["Resumen útil del negocio", BarChart3],
  ["Funciona junto a WhatsApp", CheckCircle2]
] as const;

export const faq = [
  {
    question: "¿Reemplaza WhatsApp?",
    answer: "No. Lo complementa. Podés seguir hablando por WhatsApp, pero enviar el link cuando alguien quiera reservar."
  },
  {
    question: "¿Mis clientes van a saber usarlo?",
    answer: "Sí. La reserva está pensada para celular: elegir servicio, día, horario y confirmar."
  },
  {
    question: "¿Qué diferencia hay entre Agenda Simple y Web Completa?",
    answer: "Agenda Simple es un link de reserva dentro de TuAgendaWeb. Web Completa es una web propia con dominio, landing personalizada y sistema de turnos."
  },
  {
    question: "¿Puedo empezar con Agenda Simple y después pasar a Web Completa?",
    answer: "Sí. Podés empezar simple y después dar el salto a una web completa."
  },
  {
    question: "¿La Web Completa tiene mantenimiento mensual?",
    answer: "No. La Web Completa se vende como pago único. Las mejoras posteriores se cobran por separado."
  },
  {
    question: "¿Qué pasa si dejo de pagar Agenda Simple?",
    answer: "La agenda se puede pausar o suspender hasta regularizar el pago. No se borran los datos del negocio."
  },
  {
    question: "¿Puedo usar mi logo?",
    answer: "Sí. Si tenés logo, se usa tu logo. Si no, se pueden usar iniciales."
  }
];

export const demoBySlug = Object.fromEntries(demoCategories.map((demo) => [demo.slug, demo])) as Record<string, DemoCategory>;

export const demoIcon = Scissors;
