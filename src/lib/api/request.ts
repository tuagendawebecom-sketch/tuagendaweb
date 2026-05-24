import { NextResponse } from "next/server";

export function cleanText(value: unknown, maxLength = 120) {
  return String(value ?? "")
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
  return /^\d{2}:\d{2}$/.test(value);
}

export async function readJsonRequest(request: Request, maxBytes = 4_000) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxBytes) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 }) };
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "invalid_content_type" }, { status: 415 }) };
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }) };
  }

  return { ok: true as const, body: body as Record<string, unknown> };
}
