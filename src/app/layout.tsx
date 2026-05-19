import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { TrackingProvider } from "@/components/TrackingProvider";
import { brandAssets, siteUrl } from "@/data/site";
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
    default: "TuAgendaWeb | Web propia con turnos online",
    template: "%s | TuAgendaWeb"
  },
  description:
    "Web personalizada con sistema de turnos online para negocios de Tucumán y Argentina. Landing, reservas, panel simple y dominio incluido desde $100.000.",
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
    title: "TuAgendaWeb | Web propia con turnos online",
    description: "Una web profesional con reservas desde el celular y panel simple para administrar tu negocio.",
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
  icons: {
    icon: [{ url: brandAssets.logo, type: "image/png" }],
    apple: [{ url: brandAssets.logo, type: "image/png" }]
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${jakarta.variable} ${inter.variable}`} lang="es-AR" suppressHydrationWarning>
      <body className="font-body antialiased">
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-teal focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-cream" href="#contenido">
          Saltar al contenido
        </a>
        <TrackingProvider />
        {children}
      </body>
    </html>
  );
}
