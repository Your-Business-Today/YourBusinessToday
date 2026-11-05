import { describe, expect, it, vi } from 'vitest';
import { describeMcpTools } from './mcpTools';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const descriptionOf = (name: string) => String(describeMcpTools().find((tool) => tool.name === name)?.description);

describe('which tool the plain question reaches', () => {
	it('sends "what do I need to do" to the one-item turn, not the whole list', () => {
		expect(descriptionOf('what_do_i_need_to_do')).toContain('what they need to do');
		const everything = descriptionOf('whats_outstanding_for_me');
		expect(everything).toContain('showEverything true for the whole list');
		expect(everything).toContain('use what_do_i_need_to_do');
	});

	it('gives the whole list only when asked for it in so many words', () => {
		const tool = describeMcpTools().find((candidate) => candidate.name === 'whats_outstanding_for_me');
		const schema = tool?.inputSchema as { properties: Record<string, unknown> };
		expect(Object.keys(schema.properties)).toContain('showEverything');
	});
});
