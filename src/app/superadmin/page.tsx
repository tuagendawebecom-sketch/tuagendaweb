import Link from "next/link";
import type { Metadata } from "next";
import { SuperAdminDashboard } from "@/components/SuperAdminDashboard";

export const metadata: Metadata = {
  title: "Super Admin",
  robots: { index: false, follow: false }
};

export default function SuperAdminPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-7xl">
        <Link className="text-sm font-bold text-teal hover:text-action" href="/">
          Volver al inicio
        </Link>
        <div className="mt-8">
          <SuperAdminDashboard />
        </div>
      </div>
    </main>
  );
}
