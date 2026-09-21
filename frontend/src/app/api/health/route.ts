import { NextResponse } from "next/server";

/** Liveness probe for the frontend (Vercel / uptime monitors). */
export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "shram-jagaran-frontend", time: new Date().toISOString() },
    { status: 200 },
  );
}
