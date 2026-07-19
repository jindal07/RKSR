// Self-contained PostgreSQL for development — no system install needed.
// Downloads Postgres binaries into node_modules and stores data in ./data/pg.
// Production uses any standard Postgres via DATABASE_URL.
import EmbeddedPostgres from 'embedded-postgres';

const pg = new EmbeddedPostgres({
  databaseDir: './data/pg',
  user: 'postgres',
  password: 'postgres',
  port: 5433,
  persistent: true,
});

const shutdown = async () => {
  console.log('\nStopping embedded Postgres...');
  try {
    await pg.stop();
  } finally {
    process.exit(0);
  }
};

try {
  await pg.initialise();
} catch (err) {
  // Already initialised on a previous run — fine.
  if (!String(err).includes('already') && !String(err.message || '').includes('exists')) {
    console.log('initialise:', err.message || err);
  }
}

await pg.start();

try {
  await pg.createDatabase('rks');
  console.log('Created database "rks"');
} catch {
  // already exists
}

console.log('PostgreSQL running on port 5433 (db: rks). Press Ctrl+C to stop.');
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
