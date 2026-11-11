import { describe, expect, it, vi } from 'vitest';
import { searchChatbotBrains } from './myChatbotBrains';
import { siteTeam } from './businessBrainChatbotFixtures';
import type { McpCaller } from '../resolveMcpCaller';

const trail = vi.hoisted(() => ({ questions: [] as string[], readings: [] as unknown[] }));

vi.mock('$lib/server/businessBrain/readChatbotReach', () => ({
	readChatbotsForPerson: async () => [
		{ organisation: { id: 'jewel', name: 'Jewel' }, chatbot: (await import('./businessBrainChatbotFixtures')).siteTeam },
		{ organisation: { id: 'other', name: 'Other' }, chatbot: (await import('./businessBrainChatbotFixtures')).siteTeam }
	]
}));
vi.mock('$lib/server/businessBrain/recordChatbotQuestion', () => ({
	openChatbotQuestion: async (_supabase: unknown, _place: unknown, _asker: unknown, question: string) => (trail.questions.push(question), 'question-1')
}));
vi.mock('$lib/server/businessBrain/recordChatbotReading', () => ({
	recordChatbotReading: async (_supabase: unknown, _place: unknown, made: unknown) => trail.readings.push(made)
}));
vi.mock('$lib/server/businessBrain/searchBusinessBrain', () => ({
	searchBusinessBrainParts: async () => [{ pageId: 'page-1', title: 'Opening hours', partKind: 'process', kind: 'rule', summary: '', excerpt: '', updatedAt: '2026-11-03T09:00:00Z' }]
}));

const stuart = { accountId: 'stuart', email: 'Stuart@example.com', supabase: {} } as unknown as McpCaller;

describe('searching the named brains a person may use', () => {
	it('puts the question on each chatbot record in scope before searching it, and records what the search gave', async () => {
		const scope = { organisationId: 'jewel', searchText: 'opening hours' };
		const [found] = await searchChatbotBrains(stuart, scope, 'When does the office open?');
		expect(trail.questions).toEqual(['When does the office open?']);
		expect(trail.readings).toHaveLength(1);
		expect(found).toMatchObject({ name: siteTeam.name, purpose: siteTeam.purpose });
		expect(found.readOnWith).toContain('questionId question-1');
		expect(found.pagesFound).toHaveLength(1);
	});
});
