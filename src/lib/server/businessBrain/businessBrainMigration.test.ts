import { describe, expect, it } from 'vitest';
import { expectEveryTableBehindTheModuleRule, readModuleMigration } from '$lib/server/migrations/moduleMigration.fixture';

const migration = readModuleMigration('0152_business_brain.sql', 'business_brain');
const { statements } = migration;
const oldBrainTablePattern = /\b(?:brain_\w+|domain_brains|knowledge_bases|kb_\w+|chatbots?\w*|hive_mind_\w+|workspace_\w+)\b/g;

function oldBrainTablesNamed(): string[] {
	const namesOutsideTheNewTables = statements.replace(/\bbusiness_brain\w*/g, '');
	return namesOutsideTheNewTables.match(oldBrainTablePattern) ?? [];
}

describe('the Your Business Brain migration', () => {
	it('creates only tables of its own, named business_brain', () => {
		const tables = migration.createdTables;
		expect(tables.length).toBeGreaterThan(0);
		for (const table of tables) expect(table).toMatch(/^business_brains?(_\w+)?$/);
	});

	it('names none of the old Brain tables', () => {
		expect(oldBrainTablesNamed()).toEqual([]);
	});

	it('turns on row level security on every table it creates, behind the one module rule', () => {
		expectEveryTableBehindTheModuleRule(migration);
	});

	it('deletes nothing by a cascade', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
	});
});
