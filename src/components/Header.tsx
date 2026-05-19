"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { brandAssets, demoCategories, navigation, whatsappMessages } from "@/data/site";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <Image
            alt="TuAgendaWeb"
            className="h-12 w-12 shrink-0 rounded-2xl object-contain shadow-soft sm:h-14 sm:w-14"
            height={108}
            priority
            src={brandAssets.logo}
            width={108}
          />
          <span className="truncate font-display text-xl font-extrabold text-teal sm:text-2xl">TuAgendaWeb</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) =>
            item.label === "Demos" ? (
              <div className="group relative" key={item.href}>
                <button className="inline-flex items-center gap-1 rounded-lg py-2 text-sm font-bold text-ink/75 transition hover:text-action focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/20" type="button">
                  Demos <ChevronDown size={16} />
                </button>
                <div className="invisible absolute left-1/2 top-full grid w-72 -translate-x-1/2 translate-y-3 grid-cols-2 gap-1 rounded-2xl border border-ink/10 bg-paper p-3 opacity-0 shadow-lift transition group-focus-within:visible group-focus-within:translate-y-1 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                  {demoCategories.map((demo) => (
                    <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-mint hover:text-teal" href={`/demos/${demo.slug}`} key={demo.slug}>
                      {demo.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link className="text-sm font-bold text-ink/75 transition hover:text-action" href={item.href} key={item.href}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:block">
          <WhatsAppButton href={createWhatsAppHref(whatsappMessages.heroAgenda)} label="Consultar por WhatsApp" location="header" />
        </div>

        <button
          aria-expanded={open}
          aria-label="Abrir menú"
          className="shrink-0 rounded-xl border border-ink/10 p-3 text-teal lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-ink/10 bg-paper px-4 py-5 lg:hidden">
          <nav aria-label="Mobile" className="mx-auto grid max-w-7xl gap-2">
            {navigation.map((item) => (
              <Link className="rounded-xl px-3 py-3 text-sm font-bold text-ink/75 hover:bg-mint" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 py-2">
              {demoCategories.map((demo) => (
                <Link className="rounded-xl bg-mint/60 px-3 py-2 text-sm font-semibold text-teal" href={`/demos/${demo.slug}`} key={demo.slug} onClick={() => setOpen(false)}>
                  {demo.title}
                </Link>
              ))}
            </div>
            <WhatsAppButton className="w-full" href={createWhatsAppHref(whatsappMessages.heroAgenda)} label="Consultar por WhatsApp" location="header" />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
