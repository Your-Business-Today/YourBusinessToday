import { beforeEach, describe, expect, it, vi } from 'vitest';
import { businessBrainChatbotActions } from './businessBrainChatbotActions';
import { chatbotWouldReadNothing, noSuchChatbot } from './businessBrainChatbotAnswers';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { notAnOrganisationManager } from '../organisationAccess';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { McpCaller } from '../resolveMcpCaller';

const chatbotId = '00000000-0000-0000-0000-0000000000b0';
const siteTeam: BusinessBrainChatbot = { chatbotId, name: 'Site team', madeAt: '2026-11-10T18:00:00Z', parts: ['process'], people: ['stuart@example.com'] };

const brain = vi.hoisted(() => ({
	switchedOn: ['business_brain'] as string[],
	chatbots: [] as unknown[],
	isNameTaken: false,
	make: vi.fn(),
	change: vi.fn()
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => brain.switchedOn }));
vi.mock('$lib/server/businessBrain/readBusinessBrainChatbots', () => ({ readBusinessBrainChatbots: async () => brain.chatbots }));
vi.mock('$lib/server/businessBrain/makeBusinessBrainChatbot', () => ({
	hasChatbotNamed: async () => brain.isNameTaken,
	makeBusinessBrainChatbot: async (...given: unknown[]) => {
		brain.make(...given);
		brain.chatbots = [siteTeam];
		return chatbotId;
	}
}));
vi.mock('$lib/server/businessBrain/changeBusinessBrainChatbot', () => ({ changeBusinessBrainChatbot: brain.change }));

const membership = (isManager: boolean) => [{ organisationId: 'jewel', accountId: 'nigel', isManager }];
const nigelManagingJewel = { accountId: 'nigel', isStaff: false, organisationMemberships: membership(true) } as McpCaller;
const nigelOnJewel = { ...nigelManagingJewel, organisationMemberships: membership(false) } as McpCaller;
const [makeAction, changeAction, listAction] = businessBrainChatbotActions;
const aChatbot = { organisationId: 'jewel', name: 'Site team', parts: ['process'], people: ['Stuart@example.com'] };

describe('a manager makes and changes a chatbot onto Your Business Brain', () => {
	beforeEach(() => {
		brain.switchedOn = ['business_brain'];
		brain.chatbots = [];
		brain.isNameTaken = false;
		vi.clearAllMocks();
	});

	it('asks the one module rule for every action', async () => {
		expect(businessBrainChatbotActions.every(isGatedByModuleRule)).toBe(true);
		brain.switchedOn = ['books'];
		expect(await makeAction.run(nigelManagingJewel, aChatbot)).toBe(moduleNotSwitchedOn('business_brain'));
		expect(brain.make).not.toHaveBeenCalled();
	});

	it('refuses someone on the organisation who does not manage it', async () => {
		for (const action of businessBrainChatbotActions) {
			expect(await action.run(nigelOnJewel, { ...aChatbot, chatbotId, addParts: ['people'] })).toBe(notAnOrganisationManager);
		}
		expect(brain.make).not.toHaveBeenCalled();
		expect(brain.change).not.toHaveBeenCalled();
	});

	it('makes a chatbot and gives back its id, what it reads and who uses it', async () => {
		const answer = await makeAction.run(nigelManagingJewel, aChatbot);
		expect(answer).toContain(`Chatbot id ${chatbotId}`);
		expect(answer).toContain('- Reads: Process');
		expect(answer).toContain('- Used by: stuart@example.com');
		const [, maker, made] = brain.make.mock.calls[0];
		expect(maker).toEqual({ organisationId: 'jewel', accountId: 'nigel' });
		expect(made).toEqual({ name: 'Site team', parts: ['process'], people: ['stuart@example.com'] });
	});

	it('makes no second chatbot of the same name', async () => {
		brain.isNameTaken = true;
		expect(await makeAction.run(nigelManagingJewel, aChatbot)).toContain('already has a chatbot called "Site team"');
		expect(brain.make).not.toHaveBeenCalled();
	});

	it('changes a chatbot of the organisation, and refuses one it does not have', async () => {
		const change = { organisationId: 'jewel', chatbotId, addPeople: ['nigel@example.com'] };
		expect(await changeAction.run(nigelManagingJewel, change)).toBe(noSuchChatbot);
		brain.chatbots = [siteTeam];
		expect(await changeAction.run(nigelManagingJewel, change)).toContain('It now stands so');
		expect(brain.change).toHaveBeenCalledOnce();
	});

	it('refuses a change that would leave the chatbot reading nothing', async () => {
		brain.chatbots = [siteTeam];
		const change = { organisationId: 'jewel', chatbotId, removeParts: ['process'] };
		expect(await changeAction.run(nigelManagingJewel, change)).toBe(chatbotWouldReadNothing);
		expect(brain.change).not.toHaveBeenCalled();
	});

	it('lists the chatbots for a manager', async () => {
		expect(await listAction.run(nigelManagingJewel, { organisationId: 'jewel' })).toContain('has no chatbots yet');
		brain.chatbots = [siteTeam];
		expect(await listAction.run(nigelManagingJewel, { organisationId: 'jewel' })).toContain('# one chatbot onto');
	});
});
