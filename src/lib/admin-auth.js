import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getPool } from "./db.js";

const scrypt = promisify(scryptCallback);
const COOKIE = "harar_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

export const hashToken = (value) => createHash("sha256").update(value).digest("hex");

export async function passwordMatches(password, stored) {
  const [salt, expectedHex] = String(stored || "").split(":");
  if (!/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{128}$/.test(expectedHex || "")) return false;
  const actual = await scrypt(password, Buffer.from(salt, "hex"), 64);
  const expected = Buffer.from(expectedHex, "hex");
  return timingSafeEqual(actual, expected);
}

export async function createPasswordHash(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function requestHasTrustedOrigin(request) {
  const expected = process.env.APP_ORIGIN;
  if (!expected) return false;
  return request.headers.get("origin") === expected &&
    request.headers.get("sec-fetch-site") !== "cross-site";
}

export async function createSession(userId) {
  const db = getPool();
  const token = randomBytes(32).toString("base64url");
  const csrf = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  await db.execute(
    "INSERT INTO admin_sessions (token_hash, csrf_hash, admin_id, expires_at) VALUES (?, ?, ?, ?)",
    [hashToken(token), hashToken(csrf), userId, expires]
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires,
  });
  return csrf;
}

export async function requireAdmin(request, checkCsrf = true) {
  const token = request.cookies?.get(COOKIE)?.value ??
    (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const db = getPool();
  const [rows] = await db.execute(
    "SELECT admin_id, csrf_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP LIMIT 1",
    [hashToken(token)]
  );
  if (!rows.length) return null;
  if (checkCsrf) {
    const header = request.headers.get("x-csrf-token") || "";
    const expected = Buffer.from(rows[0].csrf_hash, "hex");
    const actual = Buffer.from(hashToken(header), "hex");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  }
  return { id: rows[0].admin_id, tokenHash: hashToken(token) };
}

export async function invalidateSession(session) {
  if (session) await getPool().execute("DELETE FROM admin_sessions WHERE token_hash = ?", [session.tokenHash]);
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

export const sessionSeconds = SESSION_SECONDS;
