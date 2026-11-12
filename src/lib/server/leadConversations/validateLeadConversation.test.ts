import { describe, expect, it } from 'vitest';
import { leadConversationLimits } from '$lib/data/leadConversationRules';
import { leadConversationRefusals, validateLeadConversation } from './validateLeadConversation';

const clientId = '11111111-1111-4111-8111-111111111111';
const personId = '22222222-2222-4222-8222-222222222222';
const nigel = '33333333-3333-4333-8333-333333333333';
const chat = { clientId, personId, heldOn: '2026-11-10', channel: 'message', summary: 'Wants help with her agency spend', whatWasSaid: 'Joanne: ...' };

describe('validateLeadConversation', () => {
	it('takes a conversation that fits every column', () => {
		expect(validateLeadConversation(chat, nigel)).toEqual({ ...chat, channel: 'message', heldByAccountId: nigel });
	});

	it('takes a conversation with nobody named at the lead', () => {
		const logged = validateLeadConversation({ ...chat, personId: '' }, nigel);
		expect(logged).toMatchObject({ personId: null });
	});

	it('refuses a day that is not on the calendar', () => {
		expect(validateLeadConversation({ ...chat, heldOn: '2026-02-30' }, nigel)).toBe(leadConversationRefusals.heldOn);
	});

	it('refuses a channel it does not know', () => {
		expect(validateLeadConversation({ ...chat, channel: 'pigeon' }, nigel)).toBe(leadConversationRefusals.channel);
	});

	it('refuses an empty summary and one too long, never cutting it short', () => {
		const tooLong = 'a'.repeat(leadConversationLimits.longestSummary + 1);
		expect(validateLeadConversation({ ...chat, summary: ' ' }, nigel)).toBe(leadConversationRefusals.summary);
		expect(validateLeadConversation({ ...chat, summary: tooLong }, nigel)).toBe(leadConversationRefusals.summary);
	});

	it('refuses what was said when it is longer than its column', () => {
		const tooLong = 'a'.repeat(leadConversationLimits.longestWhatWasSaid + 1);
		expect(validateLeadConversation({ ...chat, whatWasSaid: tooLong }, nigel)).toBe(leadConversationRefusals.whatWasSaid);
	});

	it('refuses a person id that is not an id', () => {
		expect(validateLeadConversation({ ...chat, personId: 'Joanne' }, nigel)).toContain('personId');
	});
});
