import { describe, expect, it } from 'vitest';
import { fileBusinessBrainSource } from './fileBusinessBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

function recordingClient(tablesWritten: string[]): SupabaseClient {
	const written = { data: { id: 'source-1' }, error: null };
	const from = (table: string) => ({
		upsert: async () => {
			tablesWritten.push(table);
			return { error: null };
		},
		insert: () => {
			tablesWritten.push(table);
			return { select: () => ({ single: async () => written }) };
		}
	});
	return { from } as unknown as SupabaseClient;
}

describe('filing a new source into a brain', () => {
	it('makes the organisation brain before keeping the source, so the first filing is not refused', async () => {
		const tablesWritten: string[] = [];
		const source = { title: 'Rates sheet', origin: 'rates.pdf', summary: 'The plans' };
		const sourceId = await fileBusinessBrainSource(recordingClient(tablesWritten), 'organisation-1', source, 'account-1');
		expect(sourceId).toBe('source-1');
		expect(tablesWritten).toEqual(['business_brains', 'business_brain_sources']);
	});
});
