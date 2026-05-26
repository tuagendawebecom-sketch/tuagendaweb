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
  emailFormSubmit: "email_form_submit",
  leadFormOpen: "lead_form_open",
  planCardClick: "plan_card_click",
  scrollDepth: "scroll_depth",
  videoPlay: "video_play",
  mobileStickyCtaClick: "mobile_sticky_cta_click"
} as const;

export const whatsappMessages = {
  heroAgenda: "Hola, tengo un negocio con turnos y quiero probar Agenda Full por $10.000 al mes.",
  heroWeb: "Hola, quiero consultar por la Web Completa con sistema de turnos.",
  agendaSimple: "Hola, quiero consultar por Agenda Full promocional de $10.000 al mes para recibir turnos online desde un link.",
  agendaPro: "Hola, quiero consultar por Agenda Full de TuAgendaWeb para mi negocio.",
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
  { label: "Demos", href: "#demos" },
  { label: "Precios", href: "#planes" },
  { label: "FAQ", href: "#faq" }
];

export const solutionNavigation = [
  { label: "Agenda Full", href: "#agenda-simple", description: "Agenda completa dentro de TuAgendaWeb" },
  { label: "Web Completa", href: "#web-completa", description: "Web propia con dominio y turnos online" }
];

export const planOverviewNavigation = [
  { label: "Agenda Full", href: "#plan-agenda-simple" },
  { label: "Web Completa", href: "#plan-web-completa" },
  { label: "Comparativa", href: "#comparativa" }
];

export const hero = {
  eyebrow: "Turnos online para negocios locales",
  title: "Tu agenda online lista para recibir reservas desde el celular.",
  subtitle:
    "Configuramos tu negocio con servicios, horarios, personal, sucursales y un panel simple para que ordenes los turnos sin depender de coordinar todo por mensaje.",
  support:
    "Ideal para barberias, estetica, uñas, peluquerias, consultorios, canchas y profesionales que trabajan con turnos.",
  price: "Agenda Full desde $10.000/mes",
  primaryCta: "Quiero probar Agenda Full",
  secondaryCta: "Ver Web Completa"
};

export const trustSignals = [
  "Link de reserva propio para tu negocio",
  "Tus clientes eligen servicio, dia y horario",
  "Panel simple para administrar todo",
  "WhatsApp sigue siendo tu canal de contacto"
] as const;

export const heroMicroProof = [
  "Sin instalar apps",
  "Sin dominio obligatorio",
  "Listo para usar"
] as const;

export const launchOfferHighlights = [
  {
    title: "Empezás con bajo costo",
    text: "Agenda Full queda desde $10.000 al mes para validar rápido si tu negocio recibe más reservas ordenadas.",
    icon: CalendarCheck
  },
  {
    title: "Sin web completa obligatoria",
    text: "Podés vender con un link de reserva dentro de TuAgendaWeb y pasar a web propia cuando tenga sentido.",
    icon: Globe2
  },
  {
    title: "Consulta directa por WhatsApp",
    text: "La idea es cerrar dudas rápido: rubro, servicios, horarios y qué opción conviene para arrancar.",
    icon: MessageCircle
  }
] as const;

export const quickTrustNotes = [
  "Precio visible antes de escribir.",
  "Promo de lanzamiento mientras esté publicada.",
  "No reemplaza WhatsApp: lo ordena.",
  "Se puede empezar simple y crecer después."
] as const;

export const conversionProof = [
  ["Para el cliente", "Reserva desde el celular sin esperar una respuesta manual."],
  ["Para el negocio", "Turnos, servicios, personal y sucursales quedan en un panel propio."],
  ["Para ordenar la agenda", "Cada reserva queda registrada con servicio, horario, profesional y sucursal."],
  ["Para empezar rápido", "Agenda Full no exige dominio propio ni una web completa desde el día uno."]
] as const;

export const leadFormBenefits = [
  "Respuesta personalizada por WhatsApp.",
  "Recomendación según tu rubro.",
  "Sin compromiso de contratación."
] as const;

export const agendaFullHighlights = [
  ["Reserva completa", "Servicio, profesional, sucursal, calendario y horarios disponibles."],
  ["Panel para el dueño", "Dashboard, próximos turnos, configuración, servicios, personal y sucursales."],
  ["Cliente con control", "Puede consultar o cancelar su turno desde el mismo link."],
  ["Activación manual", "Si hay deuda o pausa, la agenda se suspende sin borrar datos."]
] as const;

export const reassuranceItems = [
  "No hace falta dejar WhatsApp: el link ordena la reserva y la conversación sigue ahí.",
  "La reserva está pensada para celular, con pasos simples y textos claros.",
  "Podés empezar con agenda y pasar a web completa cuando tenga sentido para tu negocio."
] as const;

export const fitChecklist = [
  "Tenés clientes que te piden turnos por mensajes.",
  "Necesitás mostrar servicios, horarios y una forma clara de reservar.",
  "Querés separar consultas reales del ida y vuelta repetitivo.",
  "Querés verte más profesional sin sumar una herramienta complicada."
] as const;

export const startRequirements = [
  ["Nombre del negocio", "Para armar el link, la agenda o la web con tu marca."],
  ["Servicios y duración", "Ejemplo: corte 45 min, limpieza facial 60 min, cancha 1 hora."],
  ["Horarios de atención", "Días, franjas y disponibilidad básica para recibir turnos."],
  ["Logo o iniciales", "Si tenés logo se usa; si no, se empieza con iniciales prolijas."],
  ["WhatsApp de contacto", "Para que la agenda complemente tu canal principal de venta."]
] as const;

export const decisionGuide = [
  ["Elegí Agenda Full", "Si querés empezar rápido con una agenda completa dentro de TuAgendaWeb."],
  ["Elegí Web Completa", "Si querés presencia propia con dominio, landing, reservas y panel."]
] as const;

export const nextSteps = [
  "Me mostrás tu negocio, rubro y cómo tomás turnos hoy.",
  "Definimos si conviene Agenda Full o Web Completa.",
  "Se cargan servicios, horarios, WhatsApp y datos básicos.",
  "Probamos el link o la web antes de compartirlo con tus clientes."
] as const;

export const credibilityNotes = [
  "Precios visibles para que sepas de entrada qué opción puede encajar.",
  "Demos por rubro para que puedas imaginar el resultado.",
  "Cada negocio puede tener su propio link de reserva ordenado.",
  "Lo incluido y lo opcional se explican por separado, sin letra chica."
] as const;

export const urgencyStrip = {
  title: "Precio promocional de lanzamiento",
  text: "Agenda Full desde $10.000 al mes para empezar a ordenar turnos sin hacer una web completa desde el primer día.",
  cta: "Ver precio promocional"
};

export const leadForm = {
  eyebrow: "Consulta guiada",
  title: "Contame qué negocio tenés y te digo cuál plan conviene.",
  text: "Si preferís no escribir todo por WhatsApp, dejá tus datos y te respondo con una recomendación concreta para tu caso.",
  submit: "Enviar consulta",
  success: "Consulta enviada. Te voy a responder por WhatsApp o email con una recomendación concreta.",
  fallback: "Si el formulario no está disponible, escribime directo por WhatsApp."
};

export const plans = [
  {
    id: "agenda_simple",
    name: "Agenda Full",
    badge: "Promo lanzamiento",
    previousPrice: "Antes $15.000 / mes",
    price: "Desde $10.000 / mes",
    description: "Un link de reservas para que tus clientes elijan servicio, día y horario desde el celular.",
    cta: "Consultar Agenda Full",
    message: whatsappMessages.agendaSimple,
    href: "#agenda-simple",
    featured: false,
    note: "Precio promocional para empezar rápido sin web completa.",
    features: [
      "Link público dentro de TuAgendaWeb",
      "Servicios, horarios, personal y sucursales",
      "Reserva desde celular",
      "Panel básico para el dueño",
      "Activación o suspensión manual desde Super Admin"
    ]
  },
  {
    id: "web_completa",
    name: "Web Completa",
    badge: "",
    previousPrice: "",
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
    benefits: ["Servicios claros antes de consultar", "Agenda por profesional o cabina", "Imagen premium para compartir"],
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
  "Link público: tuagendaweb.com.ar/tu-negocio",
  "Servicios, horarios, personal y sucursales si aplica",
  "Reserva desde celular",
  "Consulta y cancelación por celular desde el mismo link",
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
  ["Precio de entrada", "Desde $10.000 / mes", "$100.000 pago unico"],
  ["Link dentro de TuAgendaWeb", "Si", "No, usa dominio propio"],
  ["Reserva online", "Si", "Si"],
  ["Panel de administracion", "Dashboard, turnos y configuracion", "Panel completo"],
  ["Servicios, personal y sucursales", "Si", "Si"],
  ["Consulta/cancelacion por celular", "Si", "Si"],
  ["Pago", "Mensual", "Pago unico"],
  ["Dominio propio", "No", "Si"],
  ["Landing personalizada", "No", "Si"]
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
    question: "¿Qué diferencia hay entre Agenda Full y Web Completa?",
    answer: "Agenda Full es una agenda completa dentro de TuAgendaWeb desde $10.000 al mes. Web Completa es una web propia con dominio, landing personalizada y sistema de turnos."
  },
  {
    question: "¿El precio promocional es por tiempo limitado?",
    answer: "Es un precio de lanzamiento para empezar a sumar negocios. Mientras esté publicado, se respeta para nuevas consultas. Si cambia más adelante, se informa antes de contratar."
  },
  {
    question: "¿Puedo empezar con Agenda Full y después pasar a Web Completa?",
    answer: "Sí. Podés empezar simple y después dar el salto a una web completa."
  },
  {
    question: "¿La Web Completa tiene mantenimiento mensual?",
    answer: "No. La Web Completa se vende como pago único. Las mejoras posteriores se cobran por separado."
  },
  {
    question: "¿Qué pasa si dejo de pagar Agenda Full?",
    answer: "La agenda se puede pausar o suspender hasta regularizar el pago. No se borran los datos del negocio."
  },
  {
    question: "¿Puedo usar mi logo?",
    answer: "Sí. Si tenés logo, se usa tu logo. Si no, se pueden usar iniciales."
  },
  {
    question: "¿Necesito tener dominio para empezar?",
    answer: "No. Con Agenda Full podés empezar con un link dentro de TuAgendaWeb. El dominio propio aplica para Web Completa."
  },
  {
    question: "¿Qué necesito pasar para arrancar?",
    answer: "Nombre del negocio, rubro, servicios, horarios, WhatsApp y logo si tenés. Con eso ya se puede preparar una primera versión."
  }
];

export const demoBySlug = Object.fromEntries(demoCategories.map((demo) => [demo.slug, demo])) as Record<string, DemoCategory>;

export const demoIcon = Scissors;
