import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchPageThroughChatbot, partOutsideChatbot } from './describeChatbotReading';
import { chatbotId, chatbotReading, ladderRule, membersDatabase, payrollContacts, peoplePageId, personSignedInAs, processPageId, siteTeam, stuartOnSiteTeam } from './chatbotReadingFixtures';

const brain = vi.hoisted(() => ({ page: null as unknown, partsListed: [] as unknown[], partsSearched: [] as unknown[] }));

const trail = vi.hoisted(() => ({ questions: [] as { questionId: string; askedBy: string; question: string }[], readings: [] as Record<string, unknown>[] }));

vi.mock('$lib/server/businessBrain/recordChatbotQuestion', async () => (await import('./businessBrainChatbotTrailFixtures')).trailWriters(trail));
vi.mock('$lib/server/businessBrain/recordChatbotReading', () => ({
	recordChatbotReading: async (_supabase: unknown, _place: unknown, made: Record<string, unknown>) => {
		trail.readings.push(made);
	}
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async () => ({ id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/readBusinessBrainChatbots', async () => {
	const { siteTeam: chatbot } = await import('./businessBrainChatbotFixtures');
	return { readBusinessBrainChatbots: async () => [chatbot] };
});
vi.mock('$lib/server/businessBrain/readBusinessBrainIndex', () => ({
	readBrainIndexOfParts: async (_supabase: unknown, _organisationId: string, parts: unknown) => {
		brain.partsListed.push(parts);
		return { entries: [], pageCount: 0 };
	}
}));
vi.mock('$lib/server/businessBrain/searchBusinessBrain', () => ({
	searchBusinessBrainParts: async (_supabase: unknown, _organisationId: string, _search: string, parts: unknown) => {
		brain.partsSearched.push(parts);
		return [];
	}
}));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageWhole', () => ({ readBusinessBrainPageWhole: async () => brain.page }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageLinks', () => ({
	readBusinessBrainPageLinks: async () => [
		{ pageId: 'page-2', title: 'Fire door checks', linkKind: 'relates_to', isFromThisPage: true },
		{ pageId: 'page-3', title: 'Site manager rota', linkKind: 'relates_to', isFromThisPage: false }
	],
	readPageTitles: async () => new Map()
}));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageHistory', () => ({
	readBusinessBrainPageHistory: async () => ({ entries: [], revisionCount: 0 }),
	readBusinessBrainRevision: async () => null
}));
vi.mock('$lib/server/businessBrain/readKeptBusinessBrainFiles', () => ({ readKeptBusinessBrainFiles: vi.fn(), readFilesNamedByPage: vi.fn() }));
vi.mock('$lib/server/businessBrain/readPagePartKinds', () => ({
	readPagePartKinds: async () => new Map([['page-2', 'process'], ['page-3', 'people']])
}));

const question = 'Do ladders stay up overnight?';
const stuart = personSignedInAs('stuart@example.com', membersDatabase(() => [stuartOnSiteTeam]));

describe('reading through a chatbot gives back only what it covers', () => {
	beforeEach(() => {
		brain.page = ladderRule;
		brain.partsListed = [];
		brain.partsSearched = [];
	});

	it('lists only the parts the chatbot reads, and refuses a part it does not', async () => {
		await chatbotReading('read_chatbot_index').run(stuart, { chatbotId, question });
		await chatbotReading('read_chatbot_index').run(stuart, { chatbotId, question, part: 'process' });
		expect(await chatbotReading('read_chatbot_index').run(stuart, { chatbotId, question, part: 'people' })).toContain(partOutsideChatbot(siteTeam));
		expect(brain.partsListed).toEqual([['process'], ['process']]);
	});

	it('searches only the parts the chatbot reads', async () => {
		const answer = await chatbotReading('search_chatbot').run(stuart, { chatbotId, question, search: 'ladders' });
		expect(answer).toContain('through the chatbot "Site team" holds no page that matches "ladders"');
		expect(brain.partsSearched).toEqual([['process']]);
	});

	it('refuses a page in a part the chatbot does not read, as if it were not there', async () => {
		brain.page = payrollContacts;
		const answer = await chatbotReading('read_chatbot_page').run(stuart, { chatbotId, question, pageId: peoplePageId });
		expect(answer).toContain(noSuchPageThroughChatbot);
		expect(answer).not.toContain('Payroll');
		brain.page = null;
		expect(await chatbotReading('read_chatbot_page').run(stuart, { chatbotId, question, pageId: peoplePageId })).toContain(noSuchPageThroughChatbot);
	});

	it('reads a page it covers, showing only the related pages it also covers', async () => {
		const answer = await chatbotReading('read_chatbot_page').run(stuart, { chatbotId, question, pageId: processPageId });
		expect(answer).toContain('# Ladders at the end of the day');
		expect(answer).toContain('Ladders are tied off or taken down.');
		expect(answer).toContain('This page relates to **Fire door checks**');
		expect(answer).not.toContain('Site manager rota');
		expect(answer).not.toContain('open_business_brain_file');
	});
});
