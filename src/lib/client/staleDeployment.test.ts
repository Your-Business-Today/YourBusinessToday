import { describe, expect, it } from 'vitest';
import { isFromAnEarlierDeploy } from './staleDeployment';

describe('isFromAnEarlierDeploy', () => {
	it('knows each browser’s words for a script the deploy took away', () => {
		for (const message of [
			'Failed to fetch dynamically imported module: https://www.yourbusiness.today/_app/immutable/nodes/2.abc.js',
			'error loading dynamically imported module',
			'Importing a module script failed.',
			'Unable to preload CSS for /_app/immutable/assets/2.abc.css'
		]) {
			expect(isFromAnEarlierDeploy(new Error(message))).toBe(true);
		}
	});

	it('leaves every other error to the error page', () => {
		expect(isFromAnEarlierDeploy(new Error('Supabase did not answer within 8 seconds'))).toBe(false);
		expect(isFromAnEarlierDeploy('Failed to fetch dynamically imported module')).toBe(false);
	});
});
