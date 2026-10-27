# Isolated MySQL integration test on cPanel

This procedure uses a disposable cPanel database with a name ending `_test`. The test and helper scripts connect only through `TEST_DB_*`; they do not fall back to production `DB_*`. The database identifier must be explicit and must match `TEST_DB_NAME`. The scripts reject the known production database name and names containing production/live markers.

## First confirm cPanel capabilities

In cPanel, check whether **Terminal** is enabled and whether the hosting plan allows a second local Node process. Do not assume SSH, remote MySQL, or another domain is available. The commands below need cPanel Terminal (or the host's equivalent shell) and a Node.js 20 runtime. If Terminal is unavailable, ask the host to enable it or run the same commands through their supported Node.js application tooling; do not substitute production DB variables.

After the updated application files and scripts have been uploaded to the configured application root, open Terminal there. The supplied production root is `/home/unjeaxix/NewApp`; confirm `package.json`, `server.js`, `database/` and `scripts/` are directly under that root before running commands. Do not run them from the empty `harar_forex` subdirectory.

## Create an isolated database

1. In **cPanel → MySQL Databases**, create `unjeaxix_hararforex_test` (cPanel may display or require its account prefix; use the exact full database name everywhere below).
2. Create a separate test-only MySQL user and grant it privileges only on this test database: SELECT, INSERT, UPDATE, DELETE, CREATE and REFERENCES. Do not grant this test user access to the production database.
3. Initialize only the empty test database by running the guarded command below. It refuses non-empty databases. Alternatively, select the test database in phpMyAdmin and import `database/schema.sql`.

## Set test credentials in cPanel Terminal

Open cPanel Terminal in the uploaded application root. Avoid placing passwords directly in shell commands or command history. Enter these interactively in the same terminal session; the password input is silent:

```sh
export TEST_DB_NAME='unjeaxix_hararforex_test'
export TEST_DB_HOST='localhost'
export TEST_DB_PORT='3306'
export TEST_DB_USER='CPANEL_TEST_DATABASE_USER'
read -rsp 'Test database password: ' TEST_DB_PASSWORD; printf '\n'; export TEST_DB_PASSWORD
```

Replace the username with the test-only cPanel database user. If cPanel supplies a non-local MySQL hostname, use the value shown by cPanel. No remote MySQL access is assumed. Do not export or change `DB_*` for these scripts.

Confirm the shell is using the intended Node.js runtime and test database connection:

```sh
node --version
node scripts/check-test-db.cjs --test-db "$TEST_DB_NAME"
```

The expected runtime is `v20.20.2`; connectivity prints the selected test DB name and MySQL server version only. If `TEST_DB_*` are only set in Node.js Application Manager, do not assume the interactive shell inherits them; set the test values in this terminal session as above. The scripts intentionally do not read app-manager-only variables.

Initialize the test schema from the same project root and session:

```sh
node scripts/init-test-db.cjs --test-db "$TEST_DB_NAME"
```

The initializer reads the checked-in schema, connects only with `TEST_DB_*`, and refuses to run if the selected database contains any tables.

## Initialize test rows and run checks

1. Import the clearly artificial fixture. These values are for the disposable DB only:

   ```sh
   node scripts/import-rates.cjs test-data/rates.test.json --test-db "$TEST_DB_NAME"
   ```

   It inserts only if `exchange_rates` is empty. Do not use this fixture in production.
3. Create a test admin. The password prompt requires an interactive TTY and does not echo the password:

   ```sh
   node scripts/create-admin.cjs rates-test-admin --test-db "$TEST_DB_NAME"
   ```

4. Run the focused DB integration checks:

   ```sh
   node scripts/test-mysql-integration.cjs --test-db "$TEST_DB_NAME"
   ```

   The test checks schema rows, rate reads, test admin presence, a transactional update/rollback, and optimistic version conflict under a row lock. It only changes `exchange_rate_state.version` temporarily, then restores it. The attempted exchange-rate write is rolled back. It does not test HTTP login/session/cookie behavior.

Test DB selection is mandatory. This is refused:

```sh
node scripts/test-mysql-integration.cjs
```

The import and admin scripts also refuse to connect unless an explicit database mode is selected. Test mode uses only `TEST_DB_*`. Production mode requires the deliberate `--production-db <exact-name>` argument and a matching `CONFIRM_PRODUCTION_DB`; do not set that variable during testing.

## Optional local HTTP/API exercise

The API itself uses the app's `DB_*` variables, not `TEST_DB_*`. Do not change the running production application's environment to test. Only do an HTTP test if cPanel confirms Terminal access and permits a second local Node process. Use an isolated copy of the application files, `DB_*` set exclusively to the test DB credentials, `APP_ORIGIN=http://127.0.0.1:3101`, `NODE_ENV=development`, and `PORT=3101`, then start `node server.js` and access it only at `http://127.0.0.1:3101` from the same server. Do not map a public domain to it. Stop that process when done. If an isolated app copy or second local process is unavailable, skip API testing and report that limitation; do not repoint the production app.

The DB-only script above can run without a staging domain. This environment cannot verify whether the cPanel plan provides Terminal or allows a second local Node process.

## Cleanup

In cPanel, delete the entire disposable test database and its test-only database user. This removes the test administrator, session/limit rows, test rates and test schema together. Then unset the shell variables:

```sh
unset TEST_DB_NAME TEST_DB_HOST TEST_DB_PORT TEST_DB_USER TEST_DB_PASSWORD
```

Do not run cleanup commands against `DB_NAME` or the production database. Keep all production rates untouched.
