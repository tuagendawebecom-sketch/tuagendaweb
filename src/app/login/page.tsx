import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false }
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-ink sm:px-6">
      <section className="mx-auto max-w-md rounded-[2rem] border border-ink/10 bg-paper p-8 shadow-soft">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <h1 className="mt-8 font-display text-4xl font-extrabold text-teal">Acceso al panel</h1>
        <p className="mt-3 leading-7 text-ink/65">
          Ingresa con el email y la contrasena que recibiste. Si sos dueno de un negocio, vas a tu panel; si sos administrador, vas al panel general.
        </p>
        <LoginForm />
        <p className="mt-4 text-xs leading-5 text-ink/50">Si es tu primer ingreso, podes cambiar la contrasena despues de entrar.</p>
      </section>
    </main>
  );
}
