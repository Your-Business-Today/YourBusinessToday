import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0156_business_brain_search.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const oldBrainTablePattern = /\b(?:brain_\w+|domain_brains|knowledge_bases|kb_\w+|chatbots?\w*|hive_mind_\w+|workspace_\w+)\b/g;

function oldBrainTablesNamed(): string[] {
	const namesOutsideTheNewTables = statements.replace(/\bbusiness_brain\w*/g, '');
	return namesOutsideTheNewTables.match(oldBrainTablePattern) ?? [];
}

describe('the Your Business Brain search migration', () => {
	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
	});

	it('only adds, so it is safe to run twice', () => {
		expect(statements).toContain('add column if not exists search_words');
		expect(statements).toContain('create index if not exists');
		expect(statements).toContain('create or replace function public.search_business_brain');
	});

	it('names none of the old Brain tables', () => {
		expect(oldBrainTablesNamed()).toEqual([]);
	});

	it('searches as the caller, so the module rule on the pages still decides what anyone sees', () => {
		expect(statements).toContain('security invoker');
		expect(statements).not.toContain('security definer');
		expect(statements).toMatch(/revoke execute on function public\.search_business_brain\([^)]*\) from public, anon;/);
	});
});
