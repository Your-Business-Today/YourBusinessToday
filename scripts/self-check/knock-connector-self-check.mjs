import { createJiti } from 'jiti';

/** Runs the TypeScript knock with the site's $lib alias, so it uses the knock modules the site tests. */
const jiti = createJiti(import.meta.url, {
	alias: { $lib: new URL('../../src/lib', import.meta.url).pathname }
});

await jiti.import('./knockConnectorSelfCheck.ts');
