import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-ink sm:px-6">
      <section className="mx-auto max-w-md rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <h1 className="mt-8 font-display text-4xl font-extrabold text-teal">Acceso al panel</h1>
        <p className="mt-3 leading-7 text-ink/65">
          Esta ruta queda preparada para Firebase Auth con email y contraseña. Cuando cargues las variables nuevas de Firebase, se conecta al panel del negocio según businessUsers por UID.
        </p>
        <form className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Email
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" placeholder="dueño@negocio.com" type="email" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink/70">
            Contraseña
            <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" placeholder="••••••••" type="password" />
          </label>
          <button className="rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream opacity-70" disabled type="button">
            Ingresar
          </button>
        </form>
        <p className="mt-4 text-xs leading-5 text-ink/50">MVP preparado: falta activar Firebase Auth y el endpoint de sesión segura.</p>
      </section>
    </main>
  );
}
