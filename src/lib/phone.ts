export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  if (digits.startsWith("0")) return `549${digits.slice(1)}`;
  return digits.length >= 10 ? `549${digits}` : digits;
}
