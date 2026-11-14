import { describe, expect, it } from 'vitest';
import { expectEveryTableBehindTheModuleRule, expectTheShapeGuardFirst, readModuleMigration } from '$lib/server/migrations/moduleMigration.fixture';

const migration = readModuleMigration('0155_brand_kits.sql', 'brand');
const { statements } = migration;
const yourBrandTodayTables = /\b(?:brands|brand_members|brand_traits|brand_decisions)\b/g;

describe('the brand kit migration', () => {
	it('creates only tables of its own, named brand_kit', () => {
		const tables = migration.createdTables;
		expect(tables).toEqual(['brand_kits', 'brand_kit_traits', 'brand_kit_decisions']);
	});

	it('names none of the tables yourbrand.today kept', () => {
		expect(statements.match(yourBrandTodayTables) ?? []).toEqual([]);
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		expectTheShapeGuardFirst(migration);
	});

	it('turns on row level security on every table it creates, behind the one module rule', () => {
		expectEveryTableBehindTheModuleRule(migration);
	});

	it('deletes nothing by a cascade', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
	});
});
