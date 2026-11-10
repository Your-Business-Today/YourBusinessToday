import { describe, expect, it } from 'vitest';
import { companyContextLimits } from '$lib/data/companyContext/companyContextLimits';
import { joineryContextInput } from './companyContextFixtures';
import { validateCompanyContext } from './validateCompanyContext';

type Parts = Record<string, unknown>[];

function refusalFor(input: Record<string, unknown>): string {
	const reading = validateCompanyContext(input);
	return 'refusal' in reading ? reading.refusal : '';
}

function withPart(change: Record<string, unknown>, index = 0): Record<string, unknown> {
	const input = joineryContextInput();
	const parts = input.parts as Parts;
	parts[index] = { ...parts[index], ...change };
	return input;
}

describe('a company context version read from a connector call', () => {
	it('reads a whole version, numbering each process step from 1', () => {
		const reading = validateCompanyContext(joineryContextInput());
		if ('refusal' in reading) throw new Error(reading.refusal);
		expect(reading.parts).toHaveLength(5);
		expect(reading.steps.map((step) => [step.position, step.roleKey])).toEqual([
			[1, 'estimator'],
			[2, null]
		]);
		expect(reading.parts[1].seenIn).toEqual({ connector: 'Google Drive', place: 'Shared drive, Quotes folder' });
		expect(reading.parts[0].reviewState).toBe('not_checked');
	});

	it('refuses a name longer than its column, naming the part and the limit', () => {
		const longName = 'x'.repeat(companyContextLimits.nameLength + 1);
		expect(refusalFor(withPart({ name: longName }))).toBe(
			`Part "bespoke-joinery" name is too long: keep it to ${companyContextLimits.nameLength} characters.`
		);
	});

	it('refuses an email address or a phone number anywhere', () => {
		expect(refusalFor(withPart({ description: 'Ask jo@example.com' }))).toContain('email address or a phone number');
		expect(refusalFor(withPart({ seenAtPlace: 'Call 01632 960 123' }, 1))).toContain('never a person');
	});

	it('refuses a stage the offer does not have', () => {
		expect(refusalFor({ ...joineryContextInput(), stage: 'launch' })).toContain('stage must be one of');
	});

	it('refuses a part that is not right without saying what is wrong', () => {
		expect(refusalFor(withPart({ whatIsWrong: null }, 4))).toContain('say what is wrong');
	});

	it('refuses a second core area, a core that is not an area, and a repeated key', () => {
		const input = joineryContextInput();
		(input.parts as Parts).push({ key: 'fitting', kind: 'context', name: 'Fitting', isCore: true, confidence: 'low' });
		expect(refusalFor(input)).toBe('2 areas are marked core: mark one.');
		expect(refusalFor(withPart({ isCore: true }, 2))).toContain('only an area of the business');
		expect(refusalFor(withPart({ key: 'quote' }, 1))).toContain('repeats the key "quote"');
	});

	it('refuses steps on a part that is not a process, and a step whose role is not a role', () => {
		expect(refusalFor(withPart({ steps: [{ does: 'Price it' }] }, 2))).toContain('only a process has steps');
		expect(refusalFor(withPart({ steps: [{ does: 'Price it', roleKey: 'quote' }] }, 4))).toContain(
			'not the key of a role'
		);
	});

	it('refuses a link to a part the version does not hold, and a key that is not hyphenated words', () => {
		const input = joineryContextInput();
		input.links = [{ fromKey: 'quote', kind: 'goes_next_to', toKey: 'accounts-package' }];
		expect(refusalFor(input)).toBe('Link 1 toKey "accounts-package" is not the key of a part in this version.');
		expect(refusalFor(withPart({ key: 'Quote Spreadsheet' }, 1))).toContain('lower-case words joined by hyphens');
	});
});
