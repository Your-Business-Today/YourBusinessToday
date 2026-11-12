import { describe, expect, it } from 'vitest';
import { describeLeadConversations } from './describeLeadConversations';
import type { LeadConversation } from '$lib/data/leadConversationRules';

const chat: LeadConversation = {
	id: 'chat',
	personId: 'joanne',
	personName: 'Joanne Jackman',
	heldByName: 'Nigel Reilly',
	heldOn: '2026-11-10',
	channel: 'message',
	summary: 'Unhappy with her agency',
	whatWasSaid: 'Joanne: it is not working\nNigel: when suits you?',
	loggedAt: '2026-11-12T19:00:00Z'
};

describe('describeLeadConversations', () => {
	it('says how to log one when none are kept', () => {
		expect(describeLeadConversations([])[0]).toContain('log_lead_conversation');
	});

	it('gives the day, the channel, both sides and the summary, then what was said beneath', () => {
		expect(describeLeadConversations([chat])).toEqual([
			'- 2026-11-10, Messages, Nigel Reilly with Joanne Jackman: Unhappy with her agency',
			'    Joanne: it is not working\n    Nigel: when suits you?'
		]);
	});

	it('leaves out who at the lead when nobody was named', () => {
		const [heading] = describeLeadConversations([{ ...chat, personName: '', whatWasSaid: '' }]);
		expect(heading).toBe('- 2026-11-10, Messages, Nigel Reilly: Unhappy with her agency');
	});
});
