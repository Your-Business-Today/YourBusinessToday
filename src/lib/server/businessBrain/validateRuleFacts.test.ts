import { describe, expect, it } from 'vitest';
import { validateRuleFacts } from './validateRuleFacts';

const label = 'pages 1';

describe('validateRuleFacts', () => {
	it('keeps a rule filed with no kind as before, governing at least one thing', () => {
		expect(validateRuleFacts({ governs: ['work-order'] }, label)).toEqual({ governs: ['work-order'] });
		expect(validateRuleFacts({ governs: [] }, label)).toContain('at least one for an always rule');
	});

	it('takes a gate on stations or on a record reaching a status, governing nothing needed', () => {
		const onStations = validateRuleFacts({ ruleKind: 'gate', guardsStationKeys: ['award-work-order'] }, label);
		expect(onStations).toEqual({ governs: [], ruleKind: 'gate', guardsStationKeys: ['award-work-order'] });
		const onRecord = validateRuleFacts({ ruleKind: 'gate', guardsThingSlug: 'work-order', guardsStatus: 'Awarded' }, label);
		expect(onRecord).toEqual({ governs: [], ruleKind: 'gate', guardsThingSlug: 'work-order', guardsStatus: 'Awarded' });
	});

	it('refuses a gate guarding nothing, a record with no status, and a station key that is not a key', () => {
		expect(validateRuleFacts({ ruleKind: 'gate' }, label)).toContain('A gate names what it guards');
		expect(validateRuleFacts({ ruleKind: 'gate', guardsThingSlug: 'work-order' }, label)).toContain('A gate names what it guards');
		expect(validateRuleFacts({ ruleKind: 'gate', guardsStationKeys: ['Award work order'] }, label)).toContain('A gate names what it guards');
		expect(validateRuleFacts({ ruleKind: 'gate', guardsStationKeys: ['award', 'award'] }, label)).toContain('each once');
	});

	it('takes an always rule only with the things it governs', () => {
		expect(validateRuleFacts({ ruleKind: 'always', governs: ['job'] }, label)).toEqual({ governs: ['job'], ruleKind: 'always' });
		expect(validateRuleFacts({ ruleKind: 'always' }, label)).toContain('A rule names the things it governs');
	});

	it('takes a whenever rule with the event it follows and a term with its word', () => {
		const whenever = { ruleKind: 'whenever', followsEventSlug: 'contract-stack-signed' };
		expect(validateRuleFacts(whenever, label)).toEqual({ governs: [], ...whenever });
		expect(validateRuleFacts({ ruleKind: 'whenever' }, label)).toContain('followsEventSlug');
		expect(validateRuleFacts({ ruleKind: 'term', definesWord: 'payment terms' }, label)).toEqual({ governs: [], ruleKind: 'term', definesWord: 'payment terms' });
		expect(validateRuleFacts({ ruleKind: 'term' }, label)).toContain('The definesWord');
	});

	it('refuses an unknown kind, and a place that belongs to another kind, by name', () => {
		expect(validateRuleFacts({ ruleKind: 'policy', governs: ['job'] }, label)).toBe('pages 1: ruleKind is one of gate, always, whenever, term.');
		const misplaced = { ruleKind: 'always', governs: ['job'], followsEventSlug: 'job-won' };
		expect(validateRuleFacts(misplaced, label)).toBe('pages 1: followsEventSlug says where a whenever rule sits; give ruleKind whenever, or leave followsEventSlug out.');
		expect(validateRuleFacts({ governs: ['job'], guardsStationKeys: ['award'] }, label)).toContain('give ruleKind gate');
	});
});
