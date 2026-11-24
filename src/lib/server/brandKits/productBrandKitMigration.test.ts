import { describe, expect, it } from 'vitest';
import { expectNothingTakenAway, expectTheShapeGuardFirst, readModuleMigration } from '$lib/server/migrations/moduleMigration.fixture';
import { organisationExportTables } from '$lib/server/organisationExport/organisationExportTables';

const migration = readModuleMigration('0279_product_brand_kits.sql', 'brand');
const { statements, createdTables } = migration;
const productRule = 'public.can_use_product_brand(project_id)';

describe('the migration that gives a product a brand kit of its own', () => {
	it('creates the three tables of a kit, keyed by the project', () => {
		expect(createdTables).toEqual(['project_brand_kits', 'project_brand_kit_traits', 'project_brand_kit_decisions']);
		expect(statements).toContain('project_id uuid primary key references public.projects (id) on delete restrict');
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		expectTheShapeGuardFirst(migration);
	});

	it('reads the Brand module rule through the project’s organisation as it stands', () => {
		expect(statements).toContain("public.can_use_organisation_module(projects.organisation_id, 'brand')");
		for (const table of createdTables) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			const policies = statements.split('create policy').filter((policy) => policy.includes(`on public.${table}\n`));
			expect(policies.length).toBeGreaterThan(0);
			for (const policy of policies) expect(policy).toContain(productRule);
		}
	});

	it('takes nothing away, and is exported with the organisation the product is under', () => {
		expectNothingTakenAway(statements);
		const exported = organisationExportTables.map((table) => table.tableName);
		for (const table of createdTables) expect(exported).toContain(table);
	});
});
