import { describe, expect, it } from 'vitest';
import { expectEveryTableBehindTheModuleRule, expectNothingDeletedDroppedOrRewritten, expectTheShapeGuardFirst, readModuleMigration } from '$lib/server/migrations/moduleMigration.fixture';

const migration = readModuleMigration('0168_brand_content.sql', 'brand');
const { statements } = migration;
const yourBrandTodayTables = /\b(?:content_pieces|content_reviews|trends)\b/g;

describe('the brand content migration', () => {
	it('creates only tables of its own, named brand_content', () => {
		expect(migration.createdTables).toEqual(['brand_content_pieces', 'brand_content_reviews']);
	});

	it('names none of the tables yourbrand.today kept', () => {
		const withoutOwnNames = statements.replace(/brand_content_\w+/g, '');
		expect(withoutOwnNames.match(yourBrandTodayTables) ?? []).toEqual([]);
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		expectTheShapeGuardFirst(migration);
	});

	it('turns on row level security on every table it creates, behind the one module rule', () => {
		expectEveryTableBehindTheModuleRule(migration);
	});

	it('deletes, drops and rewrites nothing', () => {
		expectNothingDeletedDroppedOrRewritten(statements);
	});
});
