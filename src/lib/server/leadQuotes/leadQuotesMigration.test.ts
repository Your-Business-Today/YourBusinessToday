import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { feeBases, leadQuoteLimits as limits } from '$lib/data/leadQuoteRules';

const migration = readFileSync('migrations/0261_lead_quotes.sql', 'utf8');

describe('migration 0261, a quote on a lead, and the limits the connector checks', () => {
	it('holds the same lengths and counts as the rules', () => {
		expect(migration).toContain(`char_length(title) between 1 and ${limits.longestTitle}`);
		expect(migration).toContain(`char_length(introduction) <= ${limits.longestIntroduction}`);
		expect(migration).toContain(`char_length(terms) <= ${limits.longestTerms}`);
		expect(migration).toContain(`char_length(name) between 1 and ${limits.longestLineName}`);
		expect(migration).toContain(`char_length(delivers) <= ${limits.longestDelivers}`);
		expect(migration).toContain(`char_length(timing) <= ${limits.longestTiming}`);
		expect(migration).toContain(`char_length(fee_note) <= ${limits.longestFeeNote}`);
		expect(migration).toContain(`position between 1 and ${limits.mostLines}`);
	});

	it('allows every fee basis and only those, and a line with no amount only with a note', () => {
		expect(migration).toContain(`fee_basis in (${feeBases.map((basis) => `'${basis}'`).join(', ')})`);
		expect(migration).toContain('check (fee_amount is not null or char_length(fee_note) >= 1)');
	});

	it('files versions only through the server, one number per company', () => {
		expect(migration).toContain('unique (client_id, version)');
		expect(migration).toContain('revoke execute on function public.file_lead_quote(uuid, uuid, jsonb) from public, anon, authenticated;');
	});

	it('only creates: it alters no table that exists, updates no row and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\balter table public\.(?!lead_quote)/);
		expect(migration).not.toMatch(/\bdrop (table|column)\b/);
		expect(migration).not.toMatch(/\bdelete from\b|\bupdate public\./);
		expect(migration).toContain("set local lock_timeout = '5s';");
	});
});
