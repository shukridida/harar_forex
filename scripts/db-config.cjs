const mysql = require("mysql2/promise");

function databaseConfig({ testDatabase, productionDatabase } = {}) {
  if (testDatabase) {
    const expected = process.env.TEST_DB_NAME;
    if (!expected || expected !== testDatabase) throw new Error("Test database argument must exactly match TEST_DB_NAME");
    if (!/_test$/i.test(expected) || expected.toLowerCase() === "unjeaxix_hararforex" || /(^|_)(prod|production|live)(_|$)/i.test(expected)) {
      throw new Error("Refusing test mode: database name must be a dedicated name ending in _test");
    }
    return {
      host: required("TEST_DB_HOST"),
      port: Number(process.env.TEST_DB_PORT || 3306),
      database: expected,
      user: required("TEST_DB_USER"),
      password: required("TEST_DB_PASSWORD"),
      connectionLimit: 2,
    };
  }
  if (!productionDatabase || productionDatabase !== process.env.DB_NAME || process.env.CONFIRM_PRODUCTION_DB !== productionDatabase) {
    throw new Error("Select an explicit --test-db <name> or provide matching --production-db <name> and CONFIRM_PRODUCTION_DB");
  }
  return {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT || 3306),
    database: required("DB_NAME"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    connectionLimit: 2,
  };
}

function parseProductionDatabase(args) {
  const index = args.indexOf("--production-db");
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value || args.indexOf("--production-db", index + 1) >= 0) throw new Error("Pass one explicit --production-db <name>");
  return value;
}

function required(name) {
  if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
  return process.env[name];
}

function parseTestDatabase(args) {
  const index = args.indexOf("--test-db");
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value || args.indexOf("--test-db", index + 1) >= 0) throw new Error("Pass one explicit --test-db <name>");
  return value;
}

function createPool(options) {
  return mysql.createPool(databaseConfig(options));
}

module.exports = { createPool, parseTestDatabase, parseProductionDatabase };
