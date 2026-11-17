import { describe, expect, it } from 'vitest';
import { validateWatchedThing, watchedThingRefusals } from './validateWatchedThing';
import { watchedValueHints, watchListLimits } from '$lib/data/news/watchListRules';

describe('validateWatchedThing', () => {
	it('takes a SIC code, a CPV code with and without its check digit, and a company number', () => {
		expect(validateWatchedThing({ kind: 'sector_code', value: '43290' })).toEqual({ kind: 'sector_code', value: '43290', label: '' });
		expect(validateWatchedThing({ kind: 'sector_code', value: '45000000-7' })).toMatchObject({ value: '45000000-7' });
		expect(validateWatchedThing({ kind: 'sector_code', value: '45000000' })).toMatchObject({ value: '45000000' });
		expect(validateWatchedThing({ kind: 'company', value: 'SC123456', label: 'Jewel Property Serve' })).toEqual({
			kind: 'company',
			value: 'SC123456',
			label: 'Jewel Property Serve'
		});
	});

	it('refuses a kind the column does not hold', () => {
		expect(validateWatchedThing({ kind: 'person', value: 'Nigel' })).toBe(watchedThingRefusals.kind);
	});

	it('refuses a value that does not fit its kind, rather than mending it', () => {
		expect(validateWatchedThing({ kind: 'sector_code', value: '4329' })).toBe(watchedValueHints.sector_code);
		expect(validateWatchedThing({ kind: 'company', value: 'sc123456' })).toBe(watchedValueHints.company);
		expect(validateWatchedThing({ kind: 'company', value: '1234567' })).toBe(watchedValueHints.company);
	});

	it('refuses a blank or overlong value and an overlong label', () => {
		expect(validateWatchedThing({ kind: 'word', value: '  ' })).toBe(watchedThingRefusals.value);
		expect(validateWatchedThing({ kind: 'word', value: 'x'.repeat(watchListLimits.longestValue + 1) })).toBe(watchedThingRefusals.value);
		const overlongLabel = 'x'.repeat(watchListLimits.longestLabel + 1);
		expect(validateWatchedThing({ kind: 'word', value: 'fire door', label: overlongLabel })).toBe(watchedThingRefusals.label);
	});
});
