"use client";

import { Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { leadForm, plans, trackingEvents, whatsappMessages } from "@/data/site";
import type { LeadInterestPlan } from "@/types/tenant";
import { trackEvent } from "@/lib/tracking";
import { createWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";
import { Section } from "./Section";

const planOptions: Array<{ value: LeadInterestPlan; label: string }> = [
  { value: "agenda_simple", label: "Agenda Simple - desde $10.000/mes" },
  { value: "agenda_pro", label: "Agenda Pro - desde $20.000/mes" },
  { value: "web_completa", label: "Web Completa - $100.000 pago único" },
  { value: "not_sure", label: "No sé todavía" }
];

type FormState = "idle" | "submitting" | "success" | "error";

export function LeadCaptureForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [lastPlan, setLastPlan] = useState<LeadInterestPlan>("agenda_simple");
  const [sourceData, setSourceData] = useState({
    path: "",
    referrer: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
    utmTerm: "",
    capturedAt: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedCampaign = sessionStorage.getItem("tuagendaweb_campaign");
    let parsedCampaign: Partial<typeof sourceData> = {};
    try {
      parsedCampaign = storedCampaign ? JSON.parse(storedCampaign) as Partial<typeof sourceData> : {};
    } catch {
      parsedCampaign = {};
    }
    setSourceData({
      path: `${window.location.pathname}${window.location.search}`,
      referrer: document.referrer,
      utmSource: params.get("utm_source") ?? parsedCampaign.utmSource ?? "",
      utmMedium: params.get("utm_medium") ?? parsedCampaign.utmMedium ?? "",
      utmCampaign: params.get("utm_campaign") ?? parsedCampaign.utmCampaign ?? "",
      utmContent: params.get("utm_content") ?? parsedCampaign.utmContent ?? "",
      utmTerm: params.get("utm_term") ?? parsedCampaign.utmTerm ?? "",
      capturedAt: parsedCampaign.capturedAt ?? ""
    });
    trackEvent(trackingEvents.leadFormOpen, { location: "lead_form" });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      businessName: String(formData.get("businessName") ?? "").trim(),
      businessType: String(formData.get("businessType") ?? "").trim(),
      interestedPlan: String(formData.get("interestedPlan") ?? "not_sure"),
      message: String(formData.get("message") ?? "").trim(),
      company: String(formData.get("company") ?? ""),
      source: "landing_form",
      ...sourceData
    };

    setState("submitting");
    setError("");

    try {
      if (payload.name.length < 2 || payload.businessName.length < 2 || payload.businessType.length < 2) {
        setState("error");
        setError("Completá nombre, negocio y rubro con al menos 2 caracteres.");
        return;
      }

      if (payload.phone.replace(/\D/g, "").length < 8) {
        setState("error");
        setError("Revisá el WhatsApp. Necesito un número válido para responderte.");
        return;
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar la consulta.");
      }

      trackEvent(trackingEvents.emailFormSubmit, {
        location: "lead_form",
        interestedPlan: payload.interestedPlan,
        businessType: payload.businessType
      });
      setLastPlan(payload.interestedPlan as LeadInterestPlan);
      setState("success");
      form.reset();
    } catch {
      setState("error");
      setError("No se pudo enviar. Probá por WhatsApp y lo vemos directo.");
    }
  }

  return (
    <Section id="consultar" eyebrow={leadForm.eyebrow} text={leadForm.text} title={leadForm.title} tone="mint">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="rounded-[1.5rem] bg-teal p-7 text-cream shadow-soft">
          <h3 className="font-display text-3xl font-extrabold">Respuesta rápida para elegir bien</h3>
          <p className="mt-4 leading-7 text-cream/78">
            Te conviene mandar datos concretos: rubro, cantidad de servicios, si tenés personal y si querés solo agenda o web completa.
          </p>
          <div className="mt-6 grid gap-3">
            {plans.map((plan) => (
              <div className="rounded-2xl bg-cream/10 p-4" key={plan.id}>
                <p className="font-bold text-gold">{plan.name}</p>
                <p className="mt-1 text-sm leading-6 text-cream/75">{plan.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <WhatsAppButton href={createWhatsAppHref(whatsappMessages.pricing)} label="Prefiero WhatsApp" location="lead_form" variant="primary" />
          </div>
        </div>

        <form className="grid gap-4 rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-soft sm:p-7" onSubmit={handleSubmit}>
          <label className="hidden">
            Empresa
            <input autoComplete="off" name="company" tabIndex={-1} type="text" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-ink/70">
              Tu nombre
              <input autoComplete="name" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" maxLength={80} minLength={2} name="name" placeholder="Tu nombre" required type="text" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink/70">
              WhatsApp
              <input autoComplete="tel" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" inputMode="tel" maxLength={40} name="phone" pattern="[0-9+()\\s-]{8,}" placeholder="+54 9 381..." required type="tel" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-ink/70">
              Nombre del negocio
              <input autoComplete="organization" className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" maxLength={100} minLength={2} name="businessName" placeholder="Nombre de tu negocio" required type="text" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink/70">
              Rubro
              <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" maxLength={80} minLength={2} name="businessType" placeholder="Barbería, estética, consultorio..." required type="text" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Plan que te interesa
            <select className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" defaultValue="agenda_simple" name="interestedPlan" required>
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Mensaje opcional
            <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" maxLength={600} name="message" placeholder="Contame si ya tenés logo, dominio, servicios o cantidad de personas que atienden." />
          </label>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream shadow-lift transition hover:bg-action disabled:cursor-wait disabled:opacity-70"
            disabled={state === "submitting"}
            type="submit"
          >
            <Send size={18} />
            {state === "submitting" ? "Enviando..." : leadForm.submit}
          </button>
          <div aria-live="polite">
            {state === "success" ? (
              <div className="grid gap-3 rounded-2xl bg-mint p-4 text-sm font-bold text-teal">
                <p>{leadForm.success}</p>
                <WhatsAppButton className="w-full sm:w-fit" href={createWhatsAppHref(plans.find((plan) => plan.id === lastPlan)?.message ?? whatsappMessages.pricing)} label="Acelerar por WhatsApp" location="lead_form_success" />
              </div>
            ) : null}
            {state === "error" ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
          </div>
          <p className="text-xs leading-5 text-ink/50">{leadForm.fallback}</p>
        </form>
      </div>
    </Section>
  );
}
