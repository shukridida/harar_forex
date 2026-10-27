const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { createPool, parseTestDatabase } = require("./db-config.cjs");

async function main() {
  const database = parseTestDatabase(process.argv.slice(2));
  if (!database) throw new Error("Usage: node scripts/init-test-db.cjs --test-db <dedicated_name_test>");
  const pool = createPool({ testDatabase: database });
  try {
    const [[selected]] = await pool.query("SELECT DATABASE() AS db");
    if (selected.db !== database) throw new Error("Connected database did not match requested test identifier");
    const [tables] = await pool.execute("SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ?", [database]);
    if (Number(tables[0].n) !== 0) throw new Error("Refusing schema initialization: the test database is not empty");
    const schema = await readFile(path.join(__dirname, "..", "database", "schema.sql"), "utf8");
    for (const statement of schema.split(";").map((part) => part.trim()).filter(Boolean)) {
      await pool.query(statement);
    }
    console.log(`Initialized empty test database ${database}.`);
  } finally { await pool.end(); }
}

main().catch((error) => { console.error(`Test schema initialization failed: ${error.message}`); process.exitCode = 1; });
