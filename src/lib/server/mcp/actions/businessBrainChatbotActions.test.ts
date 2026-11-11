import { beforeEach, describe, expect, it, vi } from 'vitest';
import { businessBrainChatbotActions } from './businessBrainChatbotActions';
import { chatbotWouldReadNothing, noSuchChatbot } from './describeBusinessBrainChatbots';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { notAnOrganisationManager } from '../organisationAccess';
import * as standings from './businessBrainChatbotFixtures';
import { aChatbot, chatbotId, siteTeam } from './businessBrainChatbotFixtures';
import type { McpCaller } from '../resolveMcpCaller';


const brain = vi.hoisted(() => ({
	switchedOn: ['business_brain'] as string[],
	chatbots: [] as unknown[],
	isNameTaken: false,
	makings: [] as unknown[][],
	changes: [] as unknown[][]
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
		brain.makings.push(given);
		brain.chatbots = [siteTeam];
		return chatbotId;
	}
}));
vi.mock('$lib/server/businessBrain/changeBusinessBrainChatbot', () => ({
	changeBusinessBrainChatbot: async (...given: unknown[]) => brain.changes.push(given)
}));

const nigelManagingJewel = standings.nigelManagingJewel as McpCaller;
const nigelOnJewel = standings.nigelOnJewel as McpCaller;
const [makeAction, changeAction, listAction] = businessBrainChatbotActions;

describe('a manager makes and changes a chatbot onto Your Business Brain', () => {
	beforeEach(() => {
		brain.switchedOn = ['business_brain'];
		brain.chatbots = [];
		brain.isNameTaken = false;
		brain.makings = [];
		brain.changes = [];
	});

	it('asks the one module rule for every action', async () => {
		expect(businessBrainChatbotActions.every(isGatedByModuleRule)).toBe(true);
		brain.switchedOn = ['books'];
		expect(await makeAction.run(nigelManagingJewel, aChatbot)).toBe(moduleNotSwitchedOn('business_brain'));
		expect(brain.makings).toEqual([]);
	});

	it('refuses someone on the organisation who does not manage it', async () => {
		for (const action of businessBrainChatbotActions) {
			expect(await action.run(nigelOnJewel, { ...aChatbot, chatbotId, addParts: ['people'] })).toBe(notAnOrganisationManager);
		}
		expect(brain.makings).toEqual([]);
		expect(brain.changes).toEqual([]);
	});

	it('makes a chatbot and gives back its id, what it reads and who uses it', async () => {
		const answer = await makeAction.run(nigelManagingJewel, aChatbot);
		expect(answer).toContain(`Chatbot id ${chatbotId}`);
		expect(answer).toContain('- Reads: Process');
		expect(answer).toContain('- Used by: stuart@example.com');
		const made = { name: 'Site team', purpose: '', parts: ['process'], people: ['stuart@example.com'] };
		expect(brain.makings).toEqual([[undefined, { organisationId: 'jewel', accountId: 'nigel' }, made]]);
	});

	it('makes no second chatbot of the same name', async () => {
		brain.isNameTaken = true;
		expect(await makeAction.run(nigelManagingJewel, aChatbot)).toContain('already has a chatbot called "Site team"');
		expect(brain.makings).toEqual([]);
	});

	it('changes a chatbot of the organisation, and refuses one it does not have', async () => {
		const change = { organisationId: 'jewel', chatbotId, addPeople: ['nigel@example.com'] };
		expect(await changeAction.run(nigelManagingJewel, change)).toBe(noSuchChatbot);
		brain.chatbots = [siteTeam];
		expect(await changeAction.run(nigelManagingJewel, change)).toContain('It now stands so');
		expect(brain.changes).toHaveLength(1);
	});

	it('refuses a change that would leave the chatbot reading nothing', async () => {
		brain.chatbots = [siteTeam];
		const change = { organisationId: 'jewel', chatbotId, removeParts: ['process'] };
		expect(await changeAction.run(nigelManagingJewel, change)).toBe(chatbotWouldReadNothing);
		expect(brain.changes).toEqual([]);
	});

	it('lists the chatbots for a manager', async () => {
		expect(await listAction.run(nigelManagingJewel, { organisationId: 'jewel' })).toContain('has no chatbots yet');
		brain.chatbots = [siteTeam];
		expect(await listAction.run(nigelManagingJewel, { organisationId: 'jewel' })).toContain('# one chatbot onto');
	});
});
