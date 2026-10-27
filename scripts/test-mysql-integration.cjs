const assert = require("node:assert/strict");
const { createPool, parseTestDatabase } = require("./db-config.cjs");

async function main() {
  const database = parseTestDatabase(process.argv.slice(2));
  if (!database) throw new Error("Usage: node scripts/test-mysql-integration.cjs --test-db <dedicated_name_test>");
  const pool = createPool({ testDatabase: database });
  let originalVersion;
  let versionWasBumped = false;
  try {
    const [[dbRow]] = await pool.query("SELECT DATABASE() AS db");
    assert.equal(dbRow.db, database, "Connected database must match explicit test identifier");
    const [[rateCount]] = await pool.query("SELECT COUNT(*) AS n FROM exchange_rates");
    assert.equal(Number(rateCount.n), 14, "Expected all 14 imported rates");
    const [[state]] = await pool.query("SELECT version FROM exchange_rate_state WHERE id = 1");
    assert.ok(state, "Rate state row must exist");
    originalVersion = Number(state.version);
    const [[adminCount]] = await pool.query("SELECT COUNT(*) AS n FROM admin_accounts");
    assert.ok(Number(adminCount.n) > 0, "Create a test administrator before running integration checks");
    console.log("PASS: test database, schema, imported rates, and test administrator read");

    const [[firstBefore]] = await pool.query("SELECT buy_rate FROM exchange_rates WHERE position = 1");
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute("UPDATE exchange_rates SET buy_rate = ? WHERE position = 1", ["999999.9999"]);
      const [[during]] = await connection.query("SELECT buy_rate FROM exchange_rates WHERE position = 1");
      assert.equal(String(during.buy_rate), "999999.9999");
      await connection.rollback();
    } finally { connection.release(); }
    const [[afterRollback]] = await pool.query("SELECT buy_rate FROM exchange_rates WHERE position = 1");
    assert.equal(String(afterRollback.buy_rate), String(firstBefore.buy_rate), "Rollback must restore the original test rate");
    console.log("PASS: transactional rate write rolls back atomically");

    const bump = await pool.execute("UPDATE exchange_rate_state SET version = version + 1 WHERE id = 1 AND version = ?", [originalVersion]);
    assert.equal(bump[0].affectedRows, 1);
    versionWasBumped = true;
    const conflictConnection = await pool.getConnection();
    try {
      await conflictConnection.beginTransaction();
      const [[current]] = await conflictConnection.query("SELECT version FROM exchange_rate_state WHERE id = 1 FOR UPDATE");
      assert.notEqual(Number(current.version), originalVersion, "A stale expected version must conflict");
      await conflictConnection.rollback();
    } finally { conflictConnection.release(); }
    console.log("PASS: stale version is detected under row lock");
  } finally {
    if (versionWasBumped) {
      await pool.execute("UPDATE exchange_rate_state SET version = ? WHERE id = 1", [originalVersion]);
    }
    await pool.end();
  }
  console.log("Integration checks passed. This script changed no committed exchange-rate values.");
}

main().catch((error) => {
  console.error(`Integration test failed: ${error.message}`);
  process.exitCode = 1;
});
