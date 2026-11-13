import { describe, expect, it, vi } from 'vitest';
import { searchMyBrains } from './myBrainsRuns';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('./myOrganisationBrains', () => ({
	searchOrganisationBrains: async () => [{ name: 'Jewel’s brain, whole', purpose: 'Everything Jewel has filed', readOnWith: 'read_business_brain_page', pagesFound: [] }]
}));
vi.mock('./myChatbotBrains', () => ({
	searchChatbotBrains: async () => [{ name: 'Site team', purpose: 'For the site team', readOnWith: 'read_chatbot_page', pagesFound: [] }]
}));

const nigel = { accountId: 'nigel', isStaff: false, organisationMemberships: [] } as unknown as McpCaller;

describe('searching every brain a person reaches', () => {
	it("answers from the organisation's brain and the named brains alone", async () => {
		const answer = await searchMyBrains(nigel, { question: 'When do we open?', search: 'opening hours' });
		expect(answer).toContain('Jewel’s brain, whole');
		expect(answer).toContain('Site team');
		expect(answer).not.toContain('read_product_brain_page');
	});
});
