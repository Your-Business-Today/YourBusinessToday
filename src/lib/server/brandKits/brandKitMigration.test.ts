import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0153_brand_kits.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'brand')";
const yourBrandTodayTables = /\b(?:brands|brand_members|brand_traits|brand_decisions)\b/g;
const createdTablePattern = /create table if not exists public\.(\w+)/g;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

describe('the brand kit migration', () => {
	it('creates only tables of its own, named brand_kit', () => {
		const tables = createdTables();
		expect(tables).toEqual(['brand_kits', 'brand_kit_traits', 'brand_kit_decisions']);
	});

	it('names none of the tables yourbrand.today kept', () => {
		expect(statements.match(yourBrandTodayTables) ?? []).toEqual([]);
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		const guardAt = statements.indexOf('already exists in another shape');
		const firstCreateAt = statements.indexOf('create table');
		expect(guardAt).toBeGreaterThan(0);
		expect(guardAt).toBeLessThan(firstCreateAt);
	});

	it('turns on row level security on every table it creates, behind the one module rule', () => {
		for (const table of createdTables()) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			const policies = statements.split('create policy').filter((policy) => policy.includes(`on public.${table}\n`));
			expect(policies.length).toBeGreaterThan(0);
			for (const policy of policies) expect(policy).toContain(moduleRule);
		}
	});

	it('deletes nothing by a cascade', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
	});
});
