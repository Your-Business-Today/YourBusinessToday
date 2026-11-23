import { describe, expect, it } from 'vitest';
import { isMissingBuildFile } from './staleBuild';

describe('isMissingBuildFile', () => {
	it('knows each browser’s words for page code a newer deploy took away', () => {
		for (const message of [
			'Failed to fetch dynamically imported module: https://www.yourbusiness.today/_app/immutable/nodes/2.abc.js',
			'error loading dynamically imported module: https://www.yourbusiness.today/_app/immutable/nodes/2.abc.js',
			'Importing a module script failed.',
			'Unable to preload CSS for /_app/immutable/assets/2.abc.css'
		]) {
			expect(isMissingBuildFile(message)).toBe(true);
		}
	});

	it('leaves every other failure to the error page', () => {
		expect(isMissingBuildFile('Cannot read properties of undefined')).toBe(false);
	});
});
