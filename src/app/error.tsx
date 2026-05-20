"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 text-center text-ink">
      <section className="max-w-lg rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-action">Algo no cargó bien</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-teal">Probá recargar la página.</h1>
        <p className="mt-3 leading-7 text-ink/65">Si estabas por consultar, también podés volver al inicio y escribir por WhatsApp.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" onClick={reset} type="button">
            Reintentar
          </button>
          <Link className="rounded-2xl border border-teal px-5 py-3 text-sm font-bold text-teal" href="/">
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
