import { getPool } from "@/lib/db";
import { getPublishedRates, validateRates, CURRENCIES } from "@/lib/rates";
import { requireAdmin, requestHasTrustedOrigin } from "@/lib/admin-auth";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store, no-cache, must-revalidate, private", Pragma: "no-cache", Vary: "Cookie" };

export async function GET() {
  try {
    const data = await getPublishedRates(getPool());
    return Response.json(data, { headers });
  } catch (error) {
    return Response.json({ error: error.code === "RATES_UNINITIALIZED" ? "Rates are not initialized" : "Rates are temporarily unavailable" }, { status: 503, headers });
  }
}

export async function PUT(request) {
  if (!requestHasTrustedOrigin(request)) return Response.json({ error: "Forbidden" }, { status: 403, headers });
  try {
    const session = await requireAdmin(request);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    const body = await request.json();
    if (!body || !Number.isSafeInteger(body.version) || !validateRates(body.rates)) {
      return Response.json({ error: "Invalid rates payload" }, { status: 400, headers });
    }

    const db = getPool();
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [stateRows] = await connection.execute("SELECT version FROM exchange_rate_state WHERE id = 1 FOR UPDATE");
      if (!stateRows.length) throw Object.assign(new Error("Uninitialized"), { code: "RATES_UNINITIALIZED" });
      if (Number(stateRows[0].version) !== body.version) {
        await connection.rollback();
        return Response.json({ error: "Rates changed since you loaded them. Reload before saving." }, { status: 409, headers });
      }
      for (let i = 0; i < CURRENCIES.length; i++) {
        await connection.execute(
          "UPDATE exchange_rates SET buy_rate = ?, sell_rate = ? WHERE position = ? AND currency = ?",
          [body.rates[i].buy.toFixed(4), body.rates[i].sell.toFixed(4), i + 1, CURRENCIES[i]]
        );
      }
      await connection.execute("UPDATE exchange_rate_state SET version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1");
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return Response.json(await getPublishedRates(db), { headers });
  } catch (error) {
    const status = error.code === "RATES_UNINITIALIZED" ? 503 : 500;
    return Response.json({ error: status === 503 ? "Rates are not initialized" : "Rates could not be published" }, { status, headers });
  }
}
