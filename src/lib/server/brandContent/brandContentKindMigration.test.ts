import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ValueLimits } from '$lib/brand/values/valueLimits';

const migration = readFileSync('migrations/0186_brand_content_kind.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename|drop constraint)\b/i;

describe('the migration that gives a piece its kind of post', () => {
	it('adds the kind beside what the piece already holds, nullable and safe to run twice', () => {
		expect(statements).toContain('add column if not exists kind text');
		expect(statements).not.toMatch(/kind text[^,;]*not null/);
	});

	it('limits a kind to the length of an entry in the kit’s list, and lists no kinds', () => {
		expect(statements).toContain(`check (char_length(kind) <= ${ValueLimits.listItemCharacters})`);
		expect(statements).not.toMatch(/kind in \(/);
	});

	it('deletes, drops and rewrites nothing', () => {
		expect(statements).not.toMatch(destructiveStatement);
	});
});
