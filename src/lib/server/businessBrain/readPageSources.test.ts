import { describe, expect, it } from 'vitest';
import { readPageSources } from './readPageSources';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const organisationId = 'org-1';
const pageId = 'job';

const tables: Record<string, Row[]> = {
	business_brain_pages: [{ id: pageId, organisation_id: organisationId, source_id: 'call-notes' }],
	business_brain_page_revisions: [
		{ page_id: pageId, organisation_id: organisationId, source_id: 'price-list', revised_at: '2026-11-02T09:00:00Z' },
		{ page_id: pageId, organisation_id: organisationId, source_id: 'call-notes', revised_at: '2026-11-03T09:00:00Z' },
		{ page_id: pageId, organisation_id: organisationId, source_id: null, revised_at: '2026-11-01T09:00:00Z' },
		{ page_id: 'quote', organisation_id: organisationId, source_id: 'site-survey', revised_at: '2026-11-04T09:00:00Z' }
	],
	business_brain_sources: [
		{ id: 'call-notes', organisation_id: organisationId, title: 'Call notes', origin: 'A call', filed_at: '2026-11-03T09:00:00Z' },
		{ id: 'price-list', organisation_id: organisationId, title: 'Price list', origin: 'An upload', filed_at: '2026-11-02T09:00:00Z' },
		{ id: 'site-survey', organisation_id: organisationId, title: 'Site survey', origin: 'An upload', filed_at: '2026-11-04T09:00:00Z' }
	]
};

function queryOver(rows: Row[]) {
	let selected = [...rows];
	const query = {
		select: () => query,
		eq: (column: string, value: unknown) => ((selected = selected.filter((row) => row[column] === value)), query),
		in: (column: string, values: unknown[]) => ((selected = selected.filter((row) => values.includes(row[column]))), query),
		not: (column: string) => ((selected = selected.filter((row) => row[column] !== null)), query),
		order: (column: string) => ((selected = [...selected].sort((first, second) => String(second[column]).localeCompare(String(first[column])))), query),
		limit: () => query,
		then: (resolve: (answer: { data: Row[]; error: null }) => unknown) => resolve({ data: selected, error: null })
	};
	return query;
}

const supabase = { from: (table: string) => queryOver(tables[table]) } as unknown as SupabaseClient;

describe('readPageSources', () => {
	it('lists every source the page was filed from, as it reads now and in its history, once each and newest first', async () => {
		const sources = await readPageSources(supabase, organisationId, pageId);
		expect(sources.map((source) => source.title)).toEqual(['Call notes', 'Price list']);
	});
});
