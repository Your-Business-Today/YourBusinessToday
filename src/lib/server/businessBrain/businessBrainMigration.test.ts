import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0152_business_brain.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'business_brain')";
const oldBrainTablePattern = /\b(?:brain_\w+|domain_brains|knowledge_bases|kb_\w+|chatbots?\w*|hive_mind_\w+|workspace_\w+)\b/g;
const createdTablePattern = /create table if not exists public\.(\w+)/g;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

function oldBrainTablesNamed(): string[] {
	const namesOutsideTheNewTables = statements.replace(/\bbusiness_brain\w*/g, '');
	return namesOutsideTheNewTables.match(oldBrainTablePattern) ?? [];
}

describe('the Your Business Brain migration', () => {
	it('creates only tables of its own, named business_brain', () => {
		const tables = createdTables();
		expect(tables.length).toBeGreaterThan(0);
		for (const table of tables) expect(table).toMatch(/^business_brains?(_\w+)?$/);
	});

	it('names none of the old Brain tables', () => {
		expect(oldBrainTablesNamed()).toEqual([]);
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
