import { describe, expect, it, vi } from 'vitest';
import { readPartsTiedTo } from './productBrainParts';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./readBusinessBrainIndex', () => ({
	readPartKinds: async () => new Map([['part-people', 'people'], ['part-process', 'process']])
}));

const place = { organisationId: 'jewel', projectId: 'portal' };

function answering(answer: { data: unknown; error: unknown }): SupabaseClient {
	const query = { select: () => query, eq: () => query, is: async () => answer };
	return { from: () => query } as unknown as SupabaseClient;
}

describe("the parts tied to a product", () => {
	it("are read in the brain's own order", async () => {
		const ties = [{ part_id: 'part-people' }, { part_id: 'part-process' }];
		expect(await readPartsTiedTo(answering({ data: ties, error: null }), place)).toEqual(['process', 'people']);
	});

	it('are none before the migration that ties them has run', async () => {
		const missingTable = { code: '42P01', message: 'relation does not exist' };
		expect(await readPartsTiedTo(answering({ data: null, error: missingTable }), place)).toEqual([]);
	});
});
