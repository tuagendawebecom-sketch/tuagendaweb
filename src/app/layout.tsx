import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { TrackingProvider } from "@/components/TrackingProvider";
import { brandAssets, faq, siteUrl } from "@/data/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TuAgendaWeb | Turnos online para tu negocio",
    template: "%s | TuAgendaWeb"
  },
  description:
    "Agenda online mensual o web completa con sistema de turnos para negocios de Tucumán y Argentina. Reservas desde celular, panel simple y WhatsApp.",
  keywords: [
    "turnos online",
    "reservas online",
    "web con turnos",
    "sistema de turnos",
    "Tucumán",
    "barbería",
    "estética",
    "peluquería",
    "canchas",
    "profesionales"
  ],
  openGraph: {
    title: "TuAgendaWeb | Turnos online para tu negocio",
    description: "Elegí una agenda online mensual o una web completa con dominio, reservas desde celular y panel administrativo.",
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "TuAgendaWeb",
    images: [
      {
        url: "/assets/videos/tuagendaweb-demo-poster.png",
        width: 1920,
        height: 1080,
        alt: "TuAgendaWeb - web propia con turnos online"
      }
    ]
  },
  alternates: {
    canonical: siteUrl
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [{ url: brandAssets.logo, type: "image/png" }],
    apple: [{ url: brandAssets.logo, type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#123D3A",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "TuAgendaWeb",
    url: siteUrl,
    areaServed: ["Tucumán", "Argentina"],
    email: "tuagendaweb.ecom@gmail.com",
    description: "Agenda online y webs completas con sistema de turnos para negocios locales.",
    offers: [
      { "@type": "Offer", name: "Agenda Online", price: "10000", priceCurrency: "ARS" },
      { "@type": "Offer", name: "Agenda Pro", price: "20000", priceCurrency: "ARS" },
      { "@type": "Offer", name: "Web Completa", price: "100000", priceCurrency: "ARS" }
    ]
  };
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <html className={`${jakarta.variable} ${inter.variable}`} lang="es-AR" suppressHydrationWarning>
      <body className="font-body antialiased">
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-teal focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-cream" href="#contenido">
          Saltar al contenido
        </a>
        <TrackingProvider />
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} type="application/ld+json" />
        {children}
      </body>
    </html>
  );
}
