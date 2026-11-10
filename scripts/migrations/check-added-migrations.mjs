import { createJiti } from 'jiti';

/** Runs the TypeScript check with the site's $lib alias, so it reuses the migration modules the site tests. */
const jiti = createJiti(import.meta.url, {
	alias: { $lib: new URL('../../src/lib', import.meta.url).pathname }
});

await jiti.import('./checkAddedMigrations.ts');
