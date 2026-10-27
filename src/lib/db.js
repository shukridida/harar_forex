import mysql from "mysql2/promise";

let pool;

export function getPool() {
  if (!pool) {
    const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
    if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
      throw new Error("Database configuration is incomplete");
    }
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT || 3306),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 2,
      idleTimeout: 60000,
      decimalNumbers: false,
      charset: "utf8mb4",
    });
  }
  return pool;
}
