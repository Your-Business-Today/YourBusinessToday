import { describe, expect, it } from 'vitest';
import { deployTimeOf, isDeployTime, parseDeployTime } from './deployTime';

describe('isDeployTime', () => {
	it('takes hours and minutes, or blank for no window', () => {
		for (const written of ['', '00:00', '18:00', '23:59']) expect(isDeployTime(written)).toBe(true);
	});

	it('refuses anything the time column would not hold as a minute of the day', () => {
		for (const written of ['24:00', '18:60', '6pm', '18', '18:00:00', ' 18:00']) expect(isDeployTime(written)).toBe(false);
	});
});

describe('deploy time to and from the column', () => {
	it('writes blank as null and reads the column’s seconds back off', () => {
		expect(deployTimeOf('')).toBeNull();
		expect(deployTimeOf('18:00')).toBe('18:00');
		expect(parseDeployTime('18:00:00')).toBe('18:00');
		expect(parseDeployTime(null)).toBeNull();
	});
});
