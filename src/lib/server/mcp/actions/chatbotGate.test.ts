import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatbotReadingActions } from './chatbotReadingActions';
import { isGatedByChatbotRule, notAChatbotYouUse } from '../chatbotGate';
import { chatbotId, chatbotReading, membersDatabase, personSignedInAs, siteTeam, stuartOnSiteTeam, type MemberRow } from './chatbotReadingFixtures';

const brain = vi.hoisted(() => {
	const readings: string[] = [];
	const record = <Answer>(reading: string, answer: Answer): Answer => {
		readings.push(reading);
		return answer;
	};
	const forgetReadings = () => readings.splice(0);
	return { switchedOn: ['business_brain'] as string[], members: [] as unknown[], readings, record, forgetReadings };
});

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => brain.switchedOn }));
vi.mock('$lib/server/businessBrain/readBusinessBrainChatbots', async () => {
	const { siteTeam: chatbot } = await import('./businessBrainChatbotFixtures');
	return { readBusinessBrainChatbots: async (_supabase: unknown, _organisationId: string, id: string | null) => (id === null || id === chatbot.chatbotId ? [chatbot] : []) };
});
vi.mock('$lib/server/businessBrain/readBusinessBrainIndex', () => ({
	readBrainIndexOfParts: async () => brain.record('index', { entries: [], pageCount: 0 })
}));
vi.mock('$lib/server/businessBrain/searchBusinessBrain', () => ({ searchBusinessBrainParts: async () => brain.record('search', []) }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageWhole', () => ({ readBusinessBrainPageWhole: async () => brain.record('page', null) }));

const database = membersDatabase(() => brain.members as MemberRow[]);
const stuart = personSignedInAs('stuart@example.com', database);
const nigel = personSignedInAs('nigel@example.com', database);
const throughSiteTeam = { chatbotId, search: 'ladders', pageId: chatbotId };
const readings = ['read_chatbot_index', 'search_chatbot', 'read_chatbot_page'];

describe('who may read through a chatbot', () => {
	beforeEach(() => {
		brain.switchedOn = ['business_brain'];
		brain.members = [stuartOnSiteTeam];
		brain.forgetReadings();
	});

	it('only reads, and every reading through a chatbot asks the chatbot rule first', () => {
		expect(chatbotReadingActions.map((action) => action.isWrite)).toEqual([false, false, false, false]);
		expect(readings.map(chatbotReading).every(isGatedByChatbotRule)).toBe(true);
	});

	it('refuses a person the chatbot does not name, and reads nothing for them', async () => {
		for (const name of readings) expect(await chatbotReading(name).run(nigel, throughSiteTeam)).toBe(notAChatbotYouUse);
		expect(brain.readings).toEqual([]);
	});

	it('refuses a person taken off the chatbot', async () => {
		brain.members = [{ ...stuartOnSiteTeam, removed_at: '2026-11-10T18:00:00Z' }];
		for (const name of readings) expect(await chatbotReading(name).run(stuart, throughSiteTeam)).toBe(notAChatbotYouUse);
		expect(brain.readings).toEqual([]);
	});

	it('refuses everyone while Your Business Brain is off for the organisation', async () => {
		brain.switchedOn = ['books'];
		expect(await chatbotReading('search_chatbot').run(stuart, throughSiteTeam)).toBe(notAChatbotYouUse);
		expect(await chatbotReading('list_my_chatbots').run(stuart, {})).toContain('You may use no chatbot');
	});

	it('refuses a chatbotId that is not an id', async () => {
		expect(await chatbotReading('read_chatbot_index').run(stuart, { chatbotId: 'site team' })).toContain('The chatbotId must be an id');
	});

	it('lets in the person it names, whatever the case of the email they sign in with', async () => {
		const shouting = personSignedInAs('Stuart@Example.com', database);
		for (const name of readings) expect(await chatbotReading(name).run(shouting, throughSiteTeam)).not.toBe(notAChatbotYouUse);
		expect(brain.readings).toEqual(['index', 'search', 'page']);
	});

	it('lists the chatbots a person may use, without the other people on them', async () => {
		const listing = await chatbotReading('list_my_chatbots').run(stuart, {});
		expect(listing).toContain(`## ${siteTeam.name}`);
		expect(listing).toContain(`Chatbot id ${chatbotId}, onto Jewel Enterprises's Your Business Brain.`);
		expect(listing).toContain('- Reads: Process');
		expect(listing).not.toContain('stuart@example.com');
		expect(await chatbotReading('list_my_chatbots').run(nigel, {})).toContain('You may use no chatbot');
	});
});
