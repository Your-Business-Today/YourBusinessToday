import { createHmac, timingSafeEqual } from 'node:crypto';

const signaturePrefix = 'sha256=';

export function isGithubSignatureValid(
	payload: string,
	signatureHeader: string | null,
	secret: string
): boolean {
	if (signatureHeader === null || !signatureHeader.startsWith(signaturePrefix)) return false;
	const expected = createHmac('sha256', secret).update(payload).digest('hex');
	const received = signatureHeader.slice(signaturePrefix.length);
	if (received.length !== expected.length) return false;
	return timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'));
}
