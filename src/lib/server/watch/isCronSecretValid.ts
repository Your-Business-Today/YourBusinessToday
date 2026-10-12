import { timingSafeEqual } from 'node:crypto';

const bearerPrefix = 'Bearer ';

/** Vercel's cron runner sends the project's CRON_SECRET as a bearer token; anything else is refused. */
export function isCronSecretValid(authorisationHeader: string | null, secret: string): boolean {
	if (authorisationHeader === null || !authorisationHeader.startsWith(bearerPrefix)) return false;
	const received = Buffer.from(authorisationHeader.slice(bearerPrefix.length));
	const expected = Buffer.from(secret);
	if (received.length !== expected.length) return false;
	return timingSafeEqual(received, expected);
}
