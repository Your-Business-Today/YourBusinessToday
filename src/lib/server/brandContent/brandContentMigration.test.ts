import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0168_brand_content.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'brand')";
const yourBrandTodayTables = /\b(?:content_pieces|content_reviews|trends)\b/g;
const createdTablePattern = /create table if not exists public\.(\w+)/g;
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename)\b/i;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

describe('the brand content migration', () => {
	it('creates only tables of its own, named brand_content', () => {
		expect(createdTables()).toEqual(['brand_content_pieces', 'brand_content_reviews']);
	});

	it('names none of the tables yourbrand.today kept', () => {
		const withoutOwnNames = statements.replace(/brand_content_\w+/g, '');
		expect(withoutOwnNames.match(yourBrandTodayTables) ?? []).toEqual([]);
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		const guardAt = statements.indexOf('already exists in another shape');
		expect(guardAt).toBeGreaterThan(0);
		expect(guardAt).toBeLessThan(statements.indexOf('create table'));
	});

	it('turns on row level security on every table it creates, behind the one module rule', () => {
		for (const table of createdTables()) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			const policies = statements.split('create policy').filter((policy) => policy.includes(`on public.${table}\n`));
			expect(policies.length).toBeGreaterThan(0);
			for (const policy of policies) expect(policy).toContain(moduleRule);
		}
	});

	it('deletes, drops and rewrites nothing', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(destructiveStatement);
	});
});
