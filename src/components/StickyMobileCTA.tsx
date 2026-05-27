"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { trackingEvents, whatsappMessages } from "@/data/site";
import { trackEvent } from "@/lib/tracking";
import { createWhatsAppHref } from "@/lib/whatsapp";

export function StickyMobileCTA() {
  const href = createWhatsAppHref(whatsappMessages.heroAgenda);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-lift backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-ink/55">Promo lanzamiento</p>
          <p className="truncate text-sm font-extrabold text-teal">Agenda Full $10.000/mes</p>
        </div>
        <Link
          aria-label="Consultar TuAgendaWeb por WhatsApp"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-action px-4 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/25"
          href={href}
          onClick={() => trackEvent(trackingEvents.mobileStickyCtaClick, { location: "mobile_sticky", href })}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MessageCircle size={17} />
          WhatsApp
        </Link>
      </div>
    </div>
  );
}
