import { whatsappPhone } from "@/data/site";
import { normalizePhone } from "./phone";

export function createWhatsAppHref(message: string) {
  if (!whatsappPhone) return "#";
  return `https://wa.me/${normalizePhone(whatsappPhone)}?text=${encodeURIComponent(message)}`;
}
