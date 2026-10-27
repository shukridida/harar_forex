const { stdin, stdout } = require("node:process");
const { randomBytes, scrypt: scryptCallback } = require("node:crypto");
const { promisify } = require("node:util");
const { createPool, parseTestDatabase, parseProductionDatabase } = require("./db-config.cjs");
const scrypt = promisify(scryptCallback);

async function main() {
  const args = process.argv.slice(2);
  const testDatabase = parseTestDatabase(args);
  const productionDatabase = parseProductionDatabase(args);
  const testIndex = args.indexOf("--test-db");
  const productionIndex = args.indexOf("--production-db");
  const excluded = new Set([testIndex, testIndex + 1, productionIndex, productionIndex + 1].filter((index) => index >= 0));
  const username = args.find((_, index) => !excluded.has(index))?.trim();
  if (!username || username.length > 80) throw new Error("Usage: node scripts/create-admin.cjs <username> --test-db <name> | --production-db <name>");
  const password = await readHiddenPassword();
  if (password.length < 14) throw new Error("Password must be at least 14 characters");
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  const pool = createPool({ testDatabase, productionDatabase });
  try {
    await pool.execute("INSERT INTO admin_accounts (username, password_hash) VALUES (?, ?)", [username, `${salt.toString("hex")}:${hash.toString("hex")}`]);
    console.log("Admin account created.");
  } finally { await pool.end(); }
}

function readHiddenPassword() {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") throw new Error("Run this command from an interactive terminal so the password can be entered without echo");
  return new Promise((resolve, reject) => {
    stdout.write("New admin password (minimum 14 characters): ");
    let password = "";
    const finish = (error) => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (error) reject(error); else resolve(password);
    };
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") return finish(new Error("Password entry cancelled"));
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u007f" || char === "\b") password = password.slice(0, -1);
        else if (char >= " " && char <= "~") password += char;
      }
    };
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
