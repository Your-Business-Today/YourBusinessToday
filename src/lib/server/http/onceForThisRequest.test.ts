import { describe, expect, it } from 'vitest';
import { onceForThisRequest } from './onceForThisRequest';

describe('onceForThisRequest', () => {
	it('looks up once however many callers ask, and hands each the same answer', async () => {
		let lookupCount = 0;
		const readUser = onceForThisRequest(async () => {
			lookupCount += 1;
			return 'the signed-in user';
		});
		const answers = await Promise.all([readUser(), readUser(), readUser()]);
		expect(answers).toEqual(['the signed-in user', 'the signed-in user', 'the signed-in user']);
		expect(lookupCount).toBe(1);
	});
});
