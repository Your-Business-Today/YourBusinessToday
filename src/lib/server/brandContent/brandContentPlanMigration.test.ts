import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0183_brand_content_planned_for.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename|drop constraint)\b/i;

describe('the migration that gives a piece its planned day', () => {
	it('adds the planned day and time beside what the piece already holds, safe to run twice', () => {
		expect(statements).toContain('add column if not exists planned_for timestamptz');
		expect(statements).not.toMatch(/planned_for timestamptz not null/);
	});

	it('leaves the stage check of 0168, which already allows idea, as it is', () => {
		expect(statements).not.toMatch(/\bstage\b/);
	});

	it('deletes, drops and rewrites nothing', () => {
		expect(statements).not.toMatch(destructiveStatement);
	});
});
