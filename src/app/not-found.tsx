import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 text-center text-ink">
      <section className="max-w-lg rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-action">Página no encontrada</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-teal">Ese link no está disponible.</h1>
        <p className="mt-3 leading-7 text-ink/65">
          Puede ser una demo que cambió de dirección o una agenda todavía no activada.
        </p>
        <Link className="mt-6 inline-flex rounded-2xl bg-teal px-5 py-3 text-sm font-bold text-cream" href="/">
          Volver a TuAgendaWeb
        </Link>
      </section>
    </main>
  );
}
