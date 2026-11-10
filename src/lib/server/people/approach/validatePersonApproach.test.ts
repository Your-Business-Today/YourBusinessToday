import { describe, expect, it } from 'vitest';
import { callPlanRefusal, openingMessageRefusal, validatePersonApproach } from './validatePersonApproach';
import { personApproachLimits } from '$lib/data/personApproachRules';

const approach = {
	personId: '11111111-1111-4111-8111-111111111111',
	openingMessage: 'Hello Ada, I read about the new workshop in Guildford.',
	callPlan: 'Why: the workshop doubles the jobs to track.\nAsk: twenty minutes next week.'
};

describe('validatePersonApproach', () => {
	it('reads an approach with its opening message and call plan', () => {
		expect(validatePersonApproach(approach)).toEqual(approach);
	});

	it('refuses a person id that is not an id', () => {
		expect(validatePersonApproach({ ...approach, personId: 'ada' })).toContain('personId');
	});

	it('refuses an approach missing either half', () => {
		expect(validatePersonApproach({ ...approach, openingMessage: ' ' })).toBe(openingMessageRefusal);
		expect(validatePersonApproach({ ...approach, callPlan: undefined })).toBe(callPlanRefusal);
	});

	it('refuses rather than trims a value too long for the note', () => {
		const longMessage = 'a'.repeat(personApproachLimits.longestOpeningMessage + 1);
		expect(validatePersonApproach({ ...approach, openingMessage: longMessage })).toBe(openingMessageRefusal);
		const longPlan = 'a'.repeat(personApproachLimits.longestCallPlan + 1);
		expect(validatePersonApproach({ ...approach, callPlan: longPlan })).toBe(callPlanRefusal);
	});
});
