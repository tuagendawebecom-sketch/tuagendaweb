import { whatsappPhone } from "@/data/site";

export function createWhatsAppHref(message: string) {
  if (!whatsappPhone) return "#";
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
}
