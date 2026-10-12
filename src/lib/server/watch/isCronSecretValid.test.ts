import { describe, expect, it } from 'vitest';
import { isCronSecretValid } from './isCronSecretValid';

describe('isCronSecretValid', () => {
	it('accepts the secret as a bearer token and nothing else', () => {
		expect(isCronSecretValid('Bearer open-sesame', 'open-sesame')).toBe(true);
		expect(isCronSecretValid('Bearer open-sesam', 'open-sesame')).toBe(false);
		expect(isCronSecretValid('open-sesame', 'open-sesame')).toBe(false);
		expect(isCronSecretValid(null, 'open-sesame')).toBe(false);
	});
});
