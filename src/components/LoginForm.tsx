"use client";

import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getClientAuth, getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isFirebaseClientConfigured()) {
      setError("Firebase todavía no está configurado en este entorno.");
      return;
    }

    const auth = getClientAuth();
    const db = getClientDb();
    if (!auth || !db) {
      setError("No se pudo iniciar Firebase.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "businessUsers", credential.user.uid));
      const role = userDoc.data()?.role;

      if (role === "superadmin") {
        router.push("/superadmin");
        return;
      }

      router.push("/panel");
    } catch {
      setError("No se pudo ingresar. Revisá email, contraseña y permisos del usuario.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setMessage("");

    if (!resetEmail) {
      setError("Escribí tu email arriba para enviarte el cambio de contraseña.");
      return;
    }

    const auth = getClientAuth();
    if (!auth) {
      setError("No se pudo iniciar Firebase.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage("Te enviamos un email para cambiar tu contraseña.");
    } catch {
      setError("No se pudo enviar el email. Revisá que el correo esté bien escrito.");
    }
  }

  return (
    <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-ink/70">
        Email
        <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="email" onChange={(event) => setResetEmail(event.target.value.trim())} placeholder="admin@tuagendaweb.com.ar" required type="email" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-ink/70">
        Contraseña
        <input className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none focus:border-action" name="password" placeholder="••••••••" required type="password" />
      </label>
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-bold text-cream transition hover:bg-action disabled:cursor-wait disabled:opacity-70"
        disabled={loading}
        type="submit"
      >
        <LogIn size={18} />
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {message ? <p className="rounded-2xl bg-mint p-4 text-sm font-bold text-teal">{message}</p> : null}
      <button className="text-sm font-bold text-action hover:text-teal" onClick={handlePasswordReset} type="button">
        Quiero cambiar o recuperar mi contraseña
      </button>
    </form>
  );
}
