import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/** Tests run in node, where runes would otherwise compile as server code and effects never run. */
const compileRunesForTheClient = () => ({ generate: 'client' as const });

export default defineConfig({
	plugins: [svelte({ dynamicCompileOptions: compileRunesForTheClient })],
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
			'$env/dynamic/private': fileURLToPath(new URL('./src/lib/tests/emptyPrivateEnvironment.ts', import.meta.url))
		},
		conditions: ['browser']
	},
	test: {
		include: ['src/lib/**/*.test.ts', 'src/lib/**/*.test.svelte.ts']
	}
});
