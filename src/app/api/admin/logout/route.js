import { invalidateSession, requireAdmin } from "@/lib/admin-auth";
export const runtime = "nodejs";
export async function POST(request) {
  if (!request.headers.get("origin") || request.headers.get("origin") !== process.env.APP_ORIGIN) return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    const session = await requireAdmin(request);
    await invalidateSession(session);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Logout failed" }, { status: 500 });
  }
}
