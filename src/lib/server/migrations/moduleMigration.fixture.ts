import { readFileSync } from 'node:fs';
import { expect } from 'vitest';

/** A migration that adds a module's tables, read without its comments, with the one rule every policy of it names. */
export type ModuleMigration = { statements: string; moduleRule: string; createdTables: string[] };

const createdTablePattern = /create table if not exists public\.(\w+)/g;
const commentPattern = /--.*$/gm;

/** Reads migrations/<fileName> as the module's migration, its policies behind can_use_organisation_module for moduleName. */
export function readModuleMigration(fileName: string, moduleName: string): ModuleMigration {
	const statements = readFileSync(`migrations/${fileName}`, 'utf8').replace(commentPattern, '');
	const moduleRule = `public.can_use_organisation_module(organisation_id, '${moduleName}')`;
	const createdTables = [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
	return { statements, moduleRule, createdTables };
}

/** Every table the migration creates has row level security on, and every policy on it names the module rule. */
export function expectEveryTableBehindTheModuleRule({ statements, moduleRule, createdTables }: ModuleMigration): void {
	for (const table of createdTables) {
		expect(statements).toContain(`alter table public.${table} enable row level security;`);
		const policies = statements.split('create policy').filter((policy) => policy.includes(`on public.${table}\n`));
		expect(policies.length).toBeGreaterThan(0);
		for (const policy of policies) expect(policy).toContain(moduleRule);
	}
}

/** The migration stops before its first create table when a table of the same name is there in another shape. */
export function expectTheShapeGuardFirst({ statements }: ModuleMigration): void {
	const guardAt = statements.indexOf('already exists in another shape');
	expect(guardAt).toBeGreaterThan(0);
	expect(guardAt).toBeLessThan(statements.indexOf('create table'));
}

const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename)\b/i;
const cascadingDelete = /on delete cascade/i;

/** The statements delete nothing by a cascade, and drop, empty or rewrite no table or column. */
export function expectNothingDeletedDroppedOrRewritten(statements: string): void {
	expect(statements).not.toMatch(cascadingDelete);
	expect(statements).not.toMatch(destructiveStatement);
}
