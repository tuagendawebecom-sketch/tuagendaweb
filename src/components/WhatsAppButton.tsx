"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/tracking";

type WhatsAppButtonProps = Readonly<{
  href: string;
  label: string;
  location: string;
  category?: string;
  eventName?: string;
  variant?: "primary" | "dark" | "ghost";
  className?: string;
}>;

export function WhatsAppButton({
  href,
  label,
  location,
  category,
  eventName = "whatsapp_click",
  variant = "primary",
  className = ""
}: WhatsAppButtonProps) {
  const disabled = href === "#";
  const variantClass =
    variant === "dark"
      ? "bg-teal text-cream hover:bg-ink"
      : variant === "ghost"
        ? "border border-teal text-teal hover:bg-mint"
        : "bg-action text-white hover:bg-teal";

  return (
    <Link
      aria-label={label}
      aria-disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shadow-lift transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/25 ${disabled ? "pointer-events-none opacity-60" : ""} ${variantClass} ${className}`}
      href={href}
      onClick={() => trackEvent(eventName, { location, category, href })}
      rel="noopener noreferrer"
      target="_blank"
    >
      <MessageCircle aria-hidden="true" size={18} />
      {label}
    </Link>
  );
}
