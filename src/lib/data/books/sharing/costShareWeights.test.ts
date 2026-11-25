import { describe, expect, it } from 'vitest';
import { weightRefusal } from './costShareWeights';

describe('weightRefusal', () => {
	it('takes a number above 0 and up to a million, to four decimal places', () => {
		expect(weightRefusal(3)).toBeNull();
		expect(weightRefusal(0.0001)).toBeNull();
		expect(weightRefusal(0)).toContain('above 0');
		expect(weightRefusal(1000001)).toContain('at most 1000000');
		expect(weightRefusal(0.00001)).toContain('4 decimal places');
		expect(weightRefusal('3')).toContain('"3" was given');
	});
});
