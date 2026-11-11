import { describe, expect, it, vi } from 'vitest';
import { changeBusinessBrainChatbot } from './changeBusinessBrainChatbot';
import { siteTeam } from '$lib/server/mcp/actions/businessBrainChatbotFixtures';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./grantBusinessBrainChatbot', () => ({ addChatbotParts: async () => {}, addChatbotMembers: async () => {} }));
vi.mock('./withdrawBusinessBrainChatbot', () => ({ removeChatbotParts: async () => {}, removeChatbotMembers: async () => {} }));

const place = { organisationId: 'jewel', chatbotId: siteTeam.chatbotId, accountId: 'nigel' };
const noGrants = { addParts: [], removeParts: [], addPeople: [], removePeople: [] };

function recordingSupabase(updates: unknown[]): SupabaseClient {
	const filtered = { eq: () => filtered, error: null };
	const table = { update: (values: unknown) => (updates.push(values), filtered) };
	return { from: () => table } as unknown as SupabaseClient;
}

describe('changing what a brain is for', () => {
	it('writes a new purpose, and nothing when it is left out or already so', async () => {
		const updates: unknown[] = [];
		const supabase = recordingSupabase(updates);
		const change = (purpose: string | null) => ({ chatbotId: siteTeam.chatbotId, purpose, ...noGrants });
		await changeBusinessBrainChatbot(supabase, place, siteTeam, change('Answers the whole team'));
		await changeBusinessBrainChatbot(supabase, place, siteTeam, change(null));
		await changeBusinessBrainChatbot(supabase, place, siteTeam, change(siteTeam.purpose));
		expect(updates).toEqual([{ purpose: 'Answers the whole team' }]);
	});
});
