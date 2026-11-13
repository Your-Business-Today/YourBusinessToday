import { describe, expect, it } from 'vitest';
import { byPostedMoment, microsecondsSince1970, postedAtOnce } from './postingMoment';

describe('microsecondsSince1970', () => {
	it('keeps the microseconds the database gives, which a date alone would drop', () => {
		const wholeSecond = microsecondsSince1970('2026-10-25T09:15:00+00:00');
		expect(microsecondsSince1970('2026-10-25T09:15:00.067932+00:00') - wholeSecond).toBe(67932);
		expect(microsecondsSince1970('2026-10-25T09:15:00.5+00:00') - wholeSecond).toBe(500000);
	});
});

describe('byPostedMoment', () => {
	it('puts the earlier moment first, reading each offset, and finds two identical moments at once', () => {
		expect(byPostedMoment('2026-10-25T09:15:00.000001+00:00', '2026-10-25T09:15:00.000002+00:00')).toBeLessThan(postedAtOnce);
		expect(byPostedMoment('2026-10-25T10:15:00.25+01:00', '2026-10-25T09:15:00.1+00:00')).toBeGreaterThan(postedAtOnce);
		expect(byPostedMoment('2026-10-25T10:15:00+01:00', '2026-10-25T09:15:00+00:00')).toBe(postedAtOnce);
	});
});
