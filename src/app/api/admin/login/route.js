import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { createSession, hashToken, passwordMatches, requestHasTrustedOrigin } from "@/lib/admin-auth";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };

export async function POST(request) {
  if (!requestHasTrustedOrigin(request)) return Response.json({ error: "Forbidden" }, { status: 403, headers });
  try {
    const { username, password } = await request.json();
    if (typeof username !== "string" || typeof password !== "string" || password.length > 256) {
      return Response.json({ error: "Invalid credentials" }, { status: 400, headers });
    }
    const db = getPool();
    const forwarded = request.headers.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean);
    const ipHash = hashToken(`ip:${forwarded?.at(-1) || request.headers.get("x-real-ip") || "unknown"}`);
    const usernameHash = hashToken(`username:${username.toLowerCase()}`);
    const limitHashes = [ipHash, usernameHash].sort();
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const limitHash of limitHashes) {
        await connection.execute("INSERT IGNORE INTO admin_login_limits (limit_hash, attempts, window_started) VALUES (?, 0, CURRENT_TIMESTAMP)", [limitHash]);
      }
      const limits = [];
      for (const limitHash of limitHashes) {
        const [rows] = await connection.execute("SELECT attempts, window_started FROM admin_login_limits WHERE limit_hash = ? FOR UPDATE", [limitHash]);
        limits.push({ hash: limitHash, ...rows[0] });
      }
      const now = Date.now();
      for (const limit of limits) {
        const age = now - new Date(limit.window_started).getTime();
        if (age > 15 * 60 * 1000) {
          await connection.execute("UPDATE admin_login_limits SET attempts = 0, window_started = CURRENT_TIMESTAMP WHERE limit_hash = ?", [limit.hash]);
          limit.attempts = 0;
        } else if (Number(limit.attempts) >= 5) {
          await connection.rollback();
          return Response.json({ error: "Too many attempts. Try again later." }, { status: 429, headers });
        }
      }
      const [accounts] = await connection.execute("SELECT id, password_hash FROM admin_accounts WHERE username = ? LIMIT 1", [username]);
      const valid = accounts.length && await passwordMatches(password, accounts[0].password_hash);
      if (!valid) {
        for (const limitHash of limitHashes) await connection.execute("UPDATE admin_login_limits SET attempts = attempts + 1 WHERE limit_hash = ?", [limitHash]);
        await connection.commit();
        return Response.json({ error: "Invalid credentials" }, { status: 401, headers });
      }
      for (const limitHash of limitHashes) await connection.execute("UPDATE admin_login_limits SET attempts = 0, window_started = CURRENT_TIMESTAMP WHERE limit_hash = ?", [limitHash]);
      await connection.commit();
      const csrfToken = await createSession(accounts[0].id);
      return Response.json({ ok: true, csrfToken }, { headers });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch {
    return Response.json({ error: "Login is temporarily unavailable" }, { status: 503, headers });
  }
}
