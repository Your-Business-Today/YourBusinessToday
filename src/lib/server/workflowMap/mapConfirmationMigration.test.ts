import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { clientEventLabels } from '$lib/data/clientEventLabels';

const migration = readFileSync('migrations/0213_workflow_map_confirmations.sql', 'utf8');
const kindsBefore = readFileSync('migrations/0209_leads_brought_in_by.sql', 'utf8');

function kindsListedIn(sql: string): string[] {
	const listing = sql.slice(sql.indexOf('client_events_kind_check\n\tcheck (kind in ('));
	const closing = listing.indexOf('))');
	return [...listing.slice(0, closing).matchAll(/'([a-z_]+)'/g)].map((match) => match[1]);
}

describe('migration 0213, the confirmations of a workflow map', () => {
	it('keeps every kind of client event 0209 allowed, and adds the confirmation', () => {
		const kinds = kindsListedIn(migration);
		expect(kinds).toEqual([...kindsListedIn(kindsBefore), 'workflow_map_confirmed']);
		expect(new Set(kinds)).toEqual(new Set(Object.keys(clientEventLabels)));
	});

	it('only adds: a table of its own and one column on goals, beside the context link', () => {
		expect(migration).toContain('create table if not exists public.workflow_map_confirmations');
		expect(migration).toContain('add column if not exists workflow_map_version_id');
		expect(migration).not.toMatch(/\balter table public\.(?!workflow_map_confirmations|client_events|goals)/);
		expect(migration).not.toMatch(/\bdrop (table|column|view)\b/);
		expect(migration).not.toMatch(/\b(update|delete from|insert into)\b/);
	});

	it('keeps every column the portal reads off its goals, in the same order', () => {
		const columns = 'goal.id, goal.project_id, goal.title, goal.measure, goal.status, goal.horizon, goal.priority';
		expect(migration).toContain(`${columns},\n\t\tversion.version_number as context_version_number,`);
	});
});
