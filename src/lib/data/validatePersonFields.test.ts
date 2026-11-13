import { describe, expect, it } from 'vitest';
import { personFieldRefusals, validatePersonFields } from './validatePersonFields';

describe('the fields of a person, checked against their columns', () => {
	it('takes every field as given, trimmed, with the email lower-cased', () => {
		const changes = validatePersonFields({
			name: ' Sam Rivers ',
			email: 'Sam@Example.com',
			phone: ' 0161 ',
			seniority: 'director',
			isDecisionMaker: true,
			warmth: 'warm',
			lastContactedOn: '2026-11-10',
			nextAction: 'Call after the trade show',
			nextActionDue: '2026-11-20'
		});
		expect(changes).toEqual({
			name: 'Sam Rivers',
			email: 'sam@example.com',
			phone: '0161',
			seniority: 'director',
			isDecisionMaker: true,
			warmth: 'warm',
			lastContactedOn: '2026-11-10',
			nextAction: 'Call after the trade show',
			nextActionDue: '2026-11-20'
		});
	});

	it('changes only the fields that were sent', () => {
		expect(validatePersonFields({ warmth: 'hot' })).toEqual({ warmth: 'hot' });
	});

	it('refuses a blank name, a misshapen email, an unknown choice, a non-boolean flag and a day that is not one', () => {
		expect(validatePersonFields({ name: '  ' })).toBe(personFieldRefusals.nameRequired);
		expect(validatePersonFields({ email: 'sam at example' })).toBe(personFieldRefusals.emailNotAnAddress);
		expect(validatePersonFields({ seniority: 'boss' })).toContain('seniority is one of');
		expect(validatePersonFields({ warmth: 'tepid' })).toContain('warmth is one of');
		expect(validatePersonFields({ isDecisionMaker: 'yes' })).toBe(personFieldRefusals.decisionMakerNotYesOrNo);
		expect(validatePersonFields({ lastContactedOn: '2026-02-30' })).toBe(personFieldRefusals.lastContactedNotADay);
		expect(validatePersonFields({ nextActionDue: 'next week' })).toBe(personFieldRefusals.nextActionDueNotADay);
	});

	it('takes an empty email and an empty day as nothing held', () => {
		expect(validatePersonFields({ email: '', nextActionDue: '' })).toEqual({ email: '', nextActionDue: null });
	});
});
