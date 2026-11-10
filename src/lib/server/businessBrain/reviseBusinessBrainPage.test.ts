import { describe, expect, it } from 'vitest';
import { reviseBusinessBrainPage, type BusinessBrainPageStanding } from './reviseBusinessBrainPage';
import type { SupabaseClient } from '@supabase/supabase-js';

type Call = { table: string; verb: string; values?: unknown; filters: [string, unknown][] };

function recordingSupabase(updatedRowCount: number) {
	const calls: Call[] = [];
	const from = (table: string) => {
		const call: Call = { table, verb: '', filters: [] };
		calls.push(call);
		const answer = { data: Array.from({ length: updatedRowCount }, () => ({ id: 'page' })), error: null };
		const builder = {
			insert: (values: unknown) => Object.assign(call, { verb: 'insert', values }) && Promise.resolve({ error: null }),
			update: (values: unknown) => Object.assign(call, { verb: 'update', values }) && builder,
			eq: (column: string, value: unknown) => call.filters.push([column, value]) && builder,
			select: () => Promise.resolve(answer)
		};
		return builder;
	};
	return { supabase: { from } as unknown as SupabaseClient, calls };
}

const standing: BusinessBrainPageStanding = {
	pageId: 'page',
	sourceId: 'first-source',
	kind: 'process',
	title: 'Survey pricing',
	summary: 'Priced per door.',
	body: 'The 2026 rate.',
	facts: { ratePerDoor: 40 },
	updatedAt: '2026-11-10T09:00:00.123456+00:00'
};
const reviser = { ...standing, organisationId: 'jewel', reviserAccountId: 'nigel' };
const revision = { pageId: 'page', kind: null, title: 'Survey pricing', summary: null, body: 'The 2027 rate.', source: { sourceId: 'second-source' }, sourceId: 'second-source' };

describe('revising a page of Your Business Brain', () => {
	it('keeps the page as it stood in its history before giving it the revision', async () => {
		const { supabase, calls } = recordingSupabase(1);
		expect(await reviseBusinessBrainPage(supabase, reviser, revision)).toBe(true);
		expect(calls.map((call) => `${call.verb} ${call.table}`)).toEqual([
			'insert business_brain_page_revisions',
			'update business_brain_pages'
		]);
		expect(calls[0].values).toEqual({
			organisation_id: 'jewel',
			page_id: 'page',
			source_id: 'first-source',
			kind: 'process',
			title: 'Survey pricing',
			summary: 'Priced per door.',
			body: 'The 2026 rate.',
			facts: { ratePerDoor: 40 },
			revised_by: 'nigel'
		});
		expect(calls[1].values).toMatchObject({ source_id: 'second-source', kind: 'process', summary: 'Priced per door.', body: 'The 2027 rate.' });
	});

	it('touches the page only as it was read, within its own organisation', async () => {
		const { supabase, calls } = recordingSupabase(1);
		await reviseBusinessBrainPage(supabase, reviser, revision);
		expect(calls[1].filters).toEqual([
			['id', 'page'],
			['organisation_id', 'jewel'],
			['updated_at', standing.updatedAt]
		]);
	});

	it('says so when someone revised the page since it was read', async () => {
		const { supabase } = recordingSupabase(0);
		expect(await reviseBusinessBrainPage(supabase, reviser, revision)).toBe(false);
	});
});
