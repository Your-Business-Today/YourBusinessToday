import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0269_project_library_search.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the project library search migration', () => {
	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
	});

	it('only adds, so it is safe to run twice', () => {
		expect(statements.match(/add column if not exists search_words/g)).toHaveLength(2);
		expect(statements.match(/create index if not exists/g)).toHaveLength(2);
		expect(statements).toContain('create or replace function public.search_project_library');
	});

	it('finds only what has arrived on the project asked about', () => {
		expect(statements.match(/recorded_at is not null/g)).toHaveLength(2);
		expect(statements.match(/project_id = target_project/g)).toHaveLength(2);
	});

	it('searches as the caller, so the policies on videos and documents still decide what anyone sees', () => {
		expect(statements).toContain('security invoker');
		expect(statements).not.toContain('security definer');
		expect(statements).toMatch(/revoke execute on function public\.search_project_library\([^)]*\) from public, anon;/);
	});
});
