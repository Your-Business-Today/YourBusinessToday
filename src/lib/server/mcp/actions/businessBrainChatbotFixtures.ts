import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';

/** A chatbot onto Jewel's brain, and Nigel's standing as a manager and as a member of Jewel, as the chatbot tests use them. */
export const chatbotId = '00000000-0000-0000-0000-0000000000b0';

export const siteTeam: BusinessBrainChatbot = {
	chatbotId,
	name: 'Site team',
	madeAt: '2026-11-10T18:00:00Z',
	parts: ['process'],
	people: ['stuart@example.com']
};

export const aChatbot = { organisationId: 'jewel', name: 'Site team', parts: ['process'], people: ['Stuart@example.com'] };

const membership = (isManager: boolean) => [{ organisationId: 'jewel', accountId: 'nigel', isManager }];

export const nigelManagingJewel = { accountId: 'nigel', isStaff: false, organisationMemberships: membership(true) };

export const nigelOnJewel = { ...nigelManagingJewel, organisationMemberships: membership(false) };
