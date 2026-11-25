import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contractPackLimits as limits, contractPackStages } from '$lib/data/contractPackRules';
import { contractPackSigningLimits as signingLimits } from '$lib/data/contractPackSigningRules';

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

const signingMigration = readFileSync('migrations/0285_contract_pack_signing.sql', 'utf8');

describe('migration 0285, a client signing their pack', () => {
	it('holds the same limits as the signing rules and keeps a signature only with the authority confirmed', () => {
		expect(signingMigration).toContain(`char_length(clause) <= ${signingLimits.longestClause}`);
		expect(signingMigration).toContain(`char_length(comment) between 1 and ${signingLimits.longestComment}`);
		expect(signingMigration).toContain(`char_length(signer_name) between 1 and ${signingLimits.longestSignerName}`);
		expect(signingMigration).toContain(`char_length(signer_position) between 1 and ${signingLimits.longestSignerPosition}`);
		expect(signingMigration).toContain('check (is_authorised_to_sign)');
	});

	it('only adds', () => {
		expect(signingMigration).not.toMatch(/\bdrop (table|column)\b/);
		expect(signingMigration).not.toMatch(/\bdelete from\b|\bupdate public\./);
	});
});
