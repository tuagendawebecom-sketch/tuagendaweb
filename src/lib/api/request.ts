import { NextResponse } from "next/server";

const noStoreHeaders = { "Cache-Control": "no-store" };

export function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...noStoreHeaders,
      ...init?.headers
    }
  });
}

function stripControlChars(value: string) {
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
}

export function cleanText(value: unknown, maxLength = 120) {
  return stripControlChars(String(value ?? ""))
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export async function readJsonRequest(request: Request, maxBytes = 4_000) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxBytes) {
    return { ok: false as const, response: jsonNoStore({ ok: false, error: "payload_too_large" }, { status: 413 }) };
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false as const, response: jsonNoStore({ ok: false, error: "invalid_content_type" }, { status: 415 }) };
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return { ok: false as const, response: jsonNoStore({ ok: false, error: "invalid_json" }, { status: 400 }) };
  }

  return { ok: true as const, body: body as Record<string, unknown> };
}
