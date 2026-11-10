import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0167_business_brain_search_by_parts.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the Your Business Brain search by parts migration', () => {
	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
	});

	it('adds one function and changes no table', () => {
		expect(statements).toContain('create or replace function public.search_business_brain_parts');
		expect(statements).not.toMatch(/\b(?:create|alter|drop) table\b/);
	});

	it('finds pages only in the parts it is given', () => {
		expect(statements).toContain('part.kind = any (part_kinds)');
	});

	it('searches as the caller and is closed to anyone not signed in', () => {
		expect(statements).toContain('security invoker');
		expect(statements).not.toContain('security definer');
		expect(statements).toMatch(/revoke execute on function public\.search_business_brain_parts\([^)]*\) from public, anon;/);
	});
});
