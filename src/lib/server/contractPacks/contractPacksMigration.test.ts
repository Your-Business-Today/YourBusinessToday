import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contractPackLimits as limits, contractPackStages } from '$lib/data/contractPackRules';

const migration = readFileSync('migrations/0284_contract_packs.sql', 'utf8');

describe('migration 0284, contract packs, and the limits the doors check', () => {
	it('allows every stage and only those', () => {
		expect(migration).toContain(`check (stage in (${contractPackStages.map((stage) => `'${stage}'`).join(', ')}))`);
	});

	it('holds the same limits as the rules', () => {
		expect(migration).toContain(`cardinality(chosen_clauses) <= ${limits.mostClauses}`);
		expect(migration).toContain(`char_length(template_slug) between 1 and ${limits.longestTemplateSlug}`);
		expect(migration).toContain(`position between 1 and ${limits.mostDocuments}`);
	});

	it('only creates: it alters no table that exists, updates no row and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\balter table public\.(?!contract_pack)/);
		expect(migration).not.toMatch(/\bdrop (table|column)\b/);
		expect(migration).not.toMatch(/\bdelete from\b|\bupdate public\./);
		expect(migration).toContain("set local lock_timeout = '5s';");
	});
});
