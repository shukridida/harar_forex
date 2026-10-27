import { requireAdmin } from "@/lib/admin-auth";
import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { hashToken } from "@/lib/admin-auth";
export const runtime = "nodejs";
export async function GET(request) {
  try {
    const session = await requireAdmin(request, false);
    if (!session) return Response.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
    const csrfToken = randomBytes(32).toString("base64url");
    await getPool().execute("UPDATE admin_sessions SET csrf_hash = ? WHERE token_hash = ?", [hashToken(csrfToken), session.tokenHash]);
    return Response.json({ authenticated: true, csrfToken }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ authenticated: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
