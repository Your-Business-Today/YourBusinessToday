import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0233_brand_film_makings.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the brand film migration', () => {
	it('keeps each request in a table of its own, one open at a time for a piece, and drops nothing', () => {
		expect(statements).toContain('create table if not exists public.brand_film_makings');
		expect(statements).toContain("check (state in ('waiting', 'filming', 'ready', 'failed'))");
		expect(statements).toContain("where state in ('waiting', 'filming')");
		expect(statements).not.toMatch(/drop table|drop column|delete from|truncate|on delete cascade/i);
	});

	it('lets people with Brand read and ask under their own name, and nobody but the service move one on', () => {
		expect(statements).toContain("for select using (public.can_use_organisation_module(organisation_id, 'brand'))");
		expect(statements).toContain('and asked_by = auth.uid()');
		expect(statements).not.toMatch(/for update|for delete|for all/i);
	});
});
