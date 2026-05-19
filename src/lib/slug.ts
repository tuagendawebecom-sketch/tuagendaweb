const reservedSlugs = new Set([
  "admin",
  "superadmin",
  "panel",
  "login",
  "api",
  "precios",
  "demos",
  "contacto",
  "faq",
  "agenda",
  "reservar",
  "assets",
  "static",
  "_next"
]);

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function isReservedSlug(slug: string) {
  return reservedSlugs.has(slug);
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,62}[a-z0-9])?$/.test(slug) && !isReservedSlug(slug);
}
