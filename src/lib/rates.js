export const CURRENCIES = [
  "US DOLLAR", "EURO", "CANADIAN $", "STERLING POUND", "DIRHAM",
  "AUSTRALIAN $", "UGANDA SH", "TANZANIA SH", "SWISS FRANCS", "S.A RAND",
  "S.ARABIAN RIYAL", "INDIAN RUPEE", "CHINESE YUAN", "QATAR RIYAL",
];

export async function getPublishedRates(db) {
  const [rows] = await db.execute(
    "SELECT currency, buy_rate, sell_rate FROM exchange_rates ORDER BY position"
  );
  const [stateRows] = await db.execute(
    "SELECT version, updated_at FROM exchange_rate_state WHERE id = 1"
  );
  if (rows.length !== CURRENCIES.length || !stateRows.length) {
    const error = new Error("Rates have not been initialized");
    error.code = "RATES_UNINITIALIZED";
    throw error;
  }
  return {
    rates: rows.map((row) => ({
      currency: row.currency,
      buy: Number(row.buy_rate),
      sell: Number(row.sell_rate),
    })),
    version: Number(stateRows[0].version),
    updatedAt: stateRows[0].updated_at,
  };
}

export function validateRates(value) {
  if (!Array.isArray(value) || value.length !== CURRENCIES.length) return false;
  return value.every((rate, index) =>
    rate && rate.currency === CURRENCIES[index] &&
    validRate(rate.buy) && validRate(rate.sell)
  );
}

function validRate(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  const text = String(value);
  return value >= 0 && value <= 1000000 && /^\d{1,7}(?:\.\d{1,4})?$/.test(text);
}
