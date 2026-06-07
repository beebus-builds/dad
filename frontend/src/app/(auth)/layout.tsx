import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col gradient-union p-10 text-white">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            SJ
          </span>
          {env.appName}
        </Link>
        <div className="mt-auto space-y-4">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium leading-relaxed text-balance">
              "Solidarity is not a feeling of vague sympathy. It is a firm determination to commit
              oneself to the common good."
            </p>
            <footer className="text-sm opacity-90">— Voice of Nepalese Workers</footer>
          </blockquote>
          <div className="grid grid-cols-3 gap-4 pt-6">
            <Stat label="Members" value="120K+" />
            <Stat label="Branches" value="80+" />
            <Stat label="Districts" value="77" />
          </div>
        </div>
      </aside>
      <main id="main-content" className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
