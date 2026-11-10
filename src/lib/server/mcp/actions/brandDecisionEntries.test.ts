import { describe, expect, it } from 'vitest';
import { builtInTraits } from '$lib/brand/traits/traitCatalogue';
import { decisionEntriesOf, validateDecisionEntry, type DecisionEntry } from './brandDecisionEntries';

const entryOf = (fields: Record<string, unknown>) => decisionEntriesOf([{}, fields]).at(-1) as DecisionEntry;

describe('reading the decisions a call records', () => {
	it('numbers each decision from one, so a refusal can name it', () => {
		const entries = decisionEntriesOf([{ traitKey: 'voice.tone' }, { traitKey: 'look.colour.accent' }]);
		const empty = { mediumPath: '', rationale: '', value: undefined };
		expect(entries).toEqual([
			{ number: 1, traitKey: 'voice.tone', ...empty },
			{ number: 2, traitKey: 'look.colour.accent', ...empty }
		]);
	});

	it('refuses a call with no decisions, or more than one call may record', () => {
		expect(typeof decisionEntriesOf([])).toBe('string');
		expect(typeof decisionEntriesOf('voice.tone')).toBe('string');
		expect(decisionEntriesOf(Array.from({ length: 51 }, () => ({})))).toContain('up to 50');
	});
});

describe('checking one decision before it is kept', () => {
	it('keeps a value that fits its trait, with its rationale', () => {
		const entry = entryOf({ traitKey: 'look.colour.accent', medium: 'all', value: '#FF5A36', rationale: 'The sign' });
		expect(validateDecisionEntry(entry, builtInTraits)).toEqual({
			decision: { traitKey: 'look.colour.accent', mediumPath: 'all', value: '#ff5a36', rationale: 'The sign' }
		});
	});

	it('refuses a value that does not fit, naming the decision, never trimming it', () => {
		const entry = entryOf({ traitKey: 'look.colour.accent', medium: 'all', value: 'orange' });
		expect(validateDecisionEntry(entry, builtInTraits)).toEqual({
			refusal: 'Decision 2 (look.colour.accent @ all): Accent colour: a colour is a hex value such as #ff5a36'
		});
	});

	it('refuses a rationale longer than its column holds', () => {
		const rationale = 'x'.repeat(1001);
		const entry = entryOf({ traitKey: 'voice.tone', medium: 'all', value: 'warm', rationale });
		expect(validateDecisionEntry(entry, builtInTraits)).toEqual({
			refusal: 'Decision 2 (voice.tone @ all): keep the rationale to 1000 characters'
		});
	});
});
