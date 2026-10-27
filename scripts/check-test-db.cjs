const { createPool, parseTestDatabase } = require("./db-config.cjs");

async function main() {
  const database = parseTestDatabase(process.argv.slice(2));
  if (!database) throw new Error("Usage: node scripts/check-test-db.cjs --test-db <dedicated_name_test>");
  const pool = createPool({ testDatabase: database });
  try {
    const [[row]] = await pool.query("SELECT DATABASE() AS db, VERSION() AS version");
    if (row.db !== database) throw new Error("Connected database did not match requested test identifier");
    console.log(`Connected to test database ${row.db} (server ${row.version}).`);
  } finally { await pool.end(); }
}

main().catch((error) => { console.error(`Test DB connection failed: ${error.message}`); process.exitCode = 1; });
