const { readFile } = require("node:fs/promises");
const { createPool, parseTestDatabase, parseProductionDatabase } = require("./db-config.cjs");

const CURRENCIES = ["US DOLLAR", "EURO", "CANADIAN $", "STERLING POUND", "DIRHAM", "AUSTRALIAN $", "UGANDA SH", "TANZANIA SH", "SWISS FRANCS", "S.A RAND", "S.ARABIAN RIYAL", "INDIAN RUPEE", "CHINESE YUAN", "QATAR RIYAL"];

async function main() {
  const file = process.argv[2];
  const args = process.argv.slice(2);
  const testDatabase = parseTestDatabase(args);
  const productionDatabase = parseProductionDatabase(args);
  if (!file || file.startsWith("--")) throw new Error("Usage: node scripts/import-rates.cjs /path/to/rates.json --test-db <name> | --production-db <name>");
  const parsed = JSON.parse(await readFile(file, "utf8"));
  const rates = Array.isArray(parsed) ? parsed : parsed.rates;
  if (!Array.isArray(rates) || rates.length !== CURRENCIES.length || !rates.every((rate, index) => rate && rate.currency === CURRENCIES[index] && valid(rate.buy) && valid(rate.sell))) {
    throw new Error(`Expected ${CURRENCIES.length} ordered currencies with valid numeric buy/sell values`);
  }
  const pool = createPool({ testDatabase, productionDatabase });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute("SELECT COUNT(*) AS count FROM exchange_rates FOR UPDATE");
    if (Number(existing[0].count) !== 0) throw new Error("Import refused: exchange_rates is not empty");
    for (let i = 0; i < rates.length; i++) {
      await connection.execute("INSERT INTO exchange_rates (position, currency, buy_rate, sell_rate) VALUES (?, ?, ?, ?)", [i + 1, rates[i].currency, rates[i].buy.toFixed(4), rates[i].sell.toFixed(4)]);
    }
    await connection.execute("INSERT INTO exchange_rate_state (id, version) VALUES (1, 1)");
    await connection.commit();
    console.log("Initial published rates imported.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

function valid(value) { return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1000000 && /^\d{1,7}(?:\.\d{1,4})?$/.test(String(value)); }
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
