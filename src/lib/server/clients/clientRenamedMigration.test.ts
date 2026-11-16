import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { clientEventLabels } from '$lib/data/clientEventLabels';

const migration = readFileSync('migrations/0261_client_renamed_event.sql', 'utf8');
const kindsBefore = readFileSync('migrations/0213_workflow_map_confirmations.sql', 'utf8');

function kindsListedIn(sql: string): string[] {
	const listing = sql.slice(sql.indexOf('client_events_kind_check\n\tcheck (kind in ('));
	const closing = listing.indexOf('))');
	return [...listing.slice(0, closing).matchAll(/'([a-z_]+)'/g)].map((match) => match[1]);
}

describe('migration 0261, a company name corrected on the register', () => {
	it('keeps every kind of client event 0213 allowed, adds the rename, and names every kind the site labels', () => {
		const kinds = kindsListedIn(migration);
		expect(kinds).toEqual([...kindsListedIn(kindsBefore), 'renamed']);
		expect(new Set(kinds)).toEqual(new Set(Object.keys(clientEventLabels)));
	});

	it('gives up in seconds rather than hold the site behind a lock', () => {
		expect(migration).toContain("set local lock_timeout = '5s';");
		expect(migration).toContain("set local statement_timeout = '1min';");
	});

	it('only puts the check back: no table, column or row is touched', () => {
		expect(migration).not.toMatch(/\balter table public\.(?!client_events)/);
		expect(migration).not.toMatch(/\bdrop (table|column|view)\b/);
		expect(migration).not.toMatch(/\b(update|delete from|insert into)\b/);
	});
});
