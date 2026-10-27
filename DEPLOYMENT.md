# Rates database and cPanel setup

## Database setup

1. Create the database `unjeaxix_hararforex` and a dedicated MySQL user in cPanel. Grant the runtime user SELECT, INSERT, UPDATE and DELETE on this database's tables. Import the schema separately through phpMyAdmin so the runtime account does not need schema modification privileges.
2. Import `database/schema.sql` through phpMyAdmin. The schema creates empty tables; it does not seed or overwrite rate values.
3. Configure these environment variables in cPanel Node.js Application Manager. Keep them out of client-prefixed variables and source control:

   - `DB_HOST`, `DB_PORT` (usually `3306`), `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `APP_ORIGIN=https://www.hararforexbureau.com` (must exactly match the browser Origin)
   - `NODE_ENV=production`

4. Confirm the cPanel Node.js Application Manager is set to Node.js 20.20.2, the correct application root, Production mode, and startup file `server.js`. The project uses the existing `npm start` command (`NODE_ENV=production node server.js`). `mysql2` 3.x supports Node 20. Build-time work does not connect to MySQL.

## Initial admin account

After setting DB variables and importing the schema, create the first admin from the application root using `CONFIRM_PRODUCTION_DB="$DB_NAME" node scripts/create-admin.cjs <username> --production-db "$DB_NAME"`. Enter a unique password of at least 14 characters at the prompt. Passwords are stored as salted scrypt hashes. This command inserts one row; it does not reset existing accounts.

## Initial rates migration

The former localStorage values are device-specific and are not available to the server. Before removing/clearing that data, export the current published rates from the device that has the authoritative values as JSON with the exact existing currency order, for example:

```json
[
  {"currency":"US DOLLAR","buy":128.5,"sell":130},
  {"currency":"EURO","buy":148,"sell":150}
]
```

Include all 14 currencies and their actual current values. Save it as a protected file and run `CONFIRM_PRODUCTION_DB="$DB_NAME" node scripts/import-rates.cjs /path/to/rates.json --production-db "$DB_NAME"` after DB variables are configured. The importer validates order and values and refuses to run if any rate rows already exist. Do not use the example values as production rates unless they have been independently confirmed. For isolated testing, see [CPANEL_MYSQL_TESTING.md](CPANEL_MYSQL_TESTING.md); test mode accepts only `TEST_DB_*` variables and `_test` database names.

## Operation and verification

`GET /api/rates` returns the current rates, version and update timestamp with no-store response headers. Sign in at `/admin`; the rate update route requires a valid server session, CSRF token and matching origin. Rate updates are transactional and include an expected version, so stale admin forms receive HTTP 409 instead of overwriting a newer publication. Check API responses from a fresh browser/device after publication. Database errors return generic messages; credentials and SQL details are not returned to clients.

The rate and admin tables need only MySQL access at runtime. Login throttling is keyed by both the forwarded client IP and normalized username, so spoofing the forwarding headers alone cannot evade the username limit. Confirm cPanel's proxy supplies a trustworthy client IP header; the username limit remains active if it does not. Periodically delete expired rows from `admin_sessions` and old `admin_login_limits` rows as routine maintenance.

## Low downtime deployment and rollback

1. Export and verify the 14 current rates first. Keep a dated, access-restricted copy of that export and a backup of the existing application files.
2. Create the MySQL schema and runtime credentials before changing the running app. Import the verified rates into the empty tables and create the admin account. Check `GET /api/rates` locally against the configured application before changing the cPanel app root or restarting the live application.
3. Upload/build the new application in a staging directory if the cPanel plan permits it. Set environment variables in that app's Node.js settings, install with `npm ci`, and run `npm run build`. If staging is unavailable, schedule a short maintenance window; an uninitialized or unavailable database intentionally makes the public rates panel show an unavailable message.
4. Switch the cPanel application root to the prepared release if supported, or copy the prepared files into the configured root, then restart the application. Verify login, publish a harmless test change only if approved, and read the rate endpoint from another device.
5. If the new app fails, restore the backed-up application release and restart it. The schema is additive; rolling code back does not delete the MySQL rate tables or published rates. Do not drop tables during rollback. If the new app published incorrect rates, restore the previously verified rate export through the authenticated admin UI after confirming the current version, or use a reviewed SQL transaction; never rerun the initial importer over existing values.
