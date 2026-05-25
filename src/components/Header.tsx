"use client";

import { ChevronDown, LogIn, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { brandAssets, demoCategories, navigation, solutionNavigation, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";

export function Header() {
  const [open, setOpen] = useState(false);
  const mobileMenuId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link className="flex shrink-0 items-center gap-3" href="/">
          <Image
            alt="TuAgendaWeb"
            className="h-11 w-11 shrink-0 rounded-2xl object-contain shadow-soft xl:h-12 xl:w-12"
            height={108}
            priority
            src={brandAssets.logo}
            width={108}
          />
          <span className="font-display text-xl font-extrabold text-teal xl:text-2xl">TuAgendaWeb</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-4 xl:gap-6 lg:flex">
          <div className="group relative py-4">
            <button
              aria-haspopup="menu"
              className="inline-flex items-center gap-1 rounded-lg py-2 text-sm font-bold text-ink/75 transition hover:text-action focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/20"
              data-testid="solutions-menu-trigger"
              type="button"
            >
              Soluciones <ChevronDown size={16} />
            </button>
            <div
              className="invisible absolute left-1/2 top-[calc(100%-0.75rem)] grid w-80 -translate-x-1/2 gap-1 rounded-2xl border border-ink/10 bg-paper p-3 opacity-0 shadow-lift transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
              data-testid="solutions-menu"
              role="menu"
            >
              {solutionNavigation.map((item) => (
                <Link className="rounded-xl px-3 py-3 text-sm font-semibold text-ink/70 hover:bg-mint hover:text-teal focus-visible:bg-mint focus-visible:text-teal focus-visible:outline-none" href={item.href} key={item.href} role="menuitem">
                  <span className="block font-extrabold text-teal">{item.label}</span>
                  <span className="mt-1 block text-xs font-semibold text-ink/55">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
          {navigation.map((item) =>
            item.label === "Demos" ? (
              <div className="group relative py-4" key={item.href}>
                <button
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-1 rounded-lg py-2 text-sm font-bold text-ink/75 transition hover:text-action focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/20"
                  data-testid="demos-menu-trigger"
                  type="button"
                >
                  Demos <ChevronDown size={16} />
                </button>
                <div
                  className="invisible absolute left-1/2 top-[calc(100%-0.75rem)] grid w-80 -translate-x-1/2 grid-cols-2 gap-1 rounded-2xl border border-ink/10 bg-paper p-3 opacity-0 shadow-lift transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                  data-testid="demos-menu"
                  role="menu"
                >
                  {demoCategories.map((demo) => (
                    <Link className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/70 hover:bg-mint hover:text-teal focus-visible:bg-mint focus-visible:text-teal focus-visible:outline-none" href={`/demos/${demo.slug}`} key={demo.slug} role="menuitem">
                      {demo.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link className="text-sm font-bold text-ink/75 transition hover:text-action focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/20" href={item.href} key={item.href}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-paper px-4 py-2 text-sm font-extrabold text-teal shadow-soft transition hover:border-action hover:text-action" href="/login">
            <LogIn size={16} /> Acceso
          </Link>
          <WhatsAppButton className="min-h-11 rounded-xl px-4 py-2 shadow-soft xl:min-h-12 xl:rounded-2xl xl:px-5 xl:py-3" href={createWhatsAppHref(whatsappMessages.heroAgenda)} label="WhatsApp" location="header" />
        </div>

        <button
          aria-controls={mobileMenuId}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="shrink-0 rounded-xl border border-ink/10 p-3 text-teal lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-ink/10 bg-paper px-4 py-5 lg:hidden" id={mobileMenuId}>
          <nav aria-label="Mobile" className="mx-auto grid max-w-7xl gap-2">
            <p className="px-3 pt-1 text-xs font-extrabold uppercase tracking-[0.14em] text-action">Soluciones</p>
            {solutionNavigation.map((item) => (
              <Link className="rounded-xl bg-mint/60 px-3 py-3 text-sm font-bold text-teal" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {navigation.map((item) => (
              <Link className="rounded-xl px-3 py-3 text-sm font-bold text-ink/75 hover:bg-mint" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <p className="px-3 pt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-action">Demos</p>
            <div className="grid grid-cols-2 gap-2 py-2">
              {demoCategories.map((demo) => (
                <Link className="rounded-xl bg-mint/60 px-3 py-2 text-sm font-semibold text-teal" href={`/demos/${demo.slug}`} key={demo.slug} onClick={() => setOpen(false)}>
                  {demo.title}
                </Link>
              ))}
            </div>
            <WhatsAppButton className="w-full" href={createWhatsAppHref(whatsappMessages.heroAgenda)} label="Consultar por WhatsApp" location="header" />
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm font-extrabold text-teal" href="/login" onClick={() => setOpen(false)}>
              <LogIn size={17} /> Acceso clientes
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
