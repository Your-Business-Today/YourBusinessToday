import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { isGithubSignatureValid } from './verifyGithubSignature';

const secret = 'webhook-secret';
const payload = '{"action":"opened"}';

function signatureFor(body: string, signingSecret: string): string {
	return `sha256=${createHmac('sha256', signingSecret).update(body).digest('hex')}`;
}

describe('isGithubSignatureValid', () => {
	it('accepts the HMAC GitHub sends for the payload', () => {
		expect(isGithubSignatureValid(payload, signatureFor(payload, secret), secret)).toBe(true);
	});

	it('rejects a missing or unprefixed header', () => {
		expect(isGithubSignatureValid(payload, null, secret)).toBe(false);
		const bare = createHmac('sha256', secret).update(payload).digest('hex');
		expect(isGithubSignatureValid(payload, bare, secret)).toBe(false);
	});

	it('rejects a signature made with another secret', () => {
		expect(isGithubSignatureValid(payload, signatureFor(payload, 'other'), secret)).toBe(false);
	});

	it('rejects a signature for a different payload', () => {
		const tampered = '{"action":"closed"}';
		expect(isGithubSignatureValid(tampered, signatureFor(payload, secret), secret)).toBe(false);
	});

	it('rejects a signature of the wrong length', () => {
		expect(isGithubSignatureValid(payload, 'sha256=abc', secret)).toBe(false);
	});
});
