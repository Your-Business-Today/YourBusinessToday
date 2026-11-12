import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0203_business_brain_product_domain.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const oldBrainTablePattern = /\bpublic\.(?:brain_\w+|domain_brains|knowledge_bases|kb_\w+|chatbots?\w*|hive_mind_\w+|workspace_\w+)\b/g;

describe('the product domain migration', () => {
	it('takes away nothing already there, and names none of the old Brain tables', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements.match(oldBrainTablePattern) ?? []).toEqual([]);
		expect(statements).not.toMatch(/create table/i);
	});

	it('adds the product column only if it is not there, with nothing deleted by a cascade', () => {
		expect(statements).toContain('add column if not exists project_id uuid references public.projects (id) on delete restrict');
		expect(statements).not.toMatch(/on delete cascade/i);
	});

	it('builds both slug indexes before it lets the one unique slug per part go', () => {
		const organisationIndex = statements.indexOf('business_brain_pages_one_slug_per_part');
		const productIndex = statements.indexOf('business_brain_pages_one_slug_per_product');
		const letGo = statements.indexOf('drop constraint if exists business_brain_pages_part_id_slug_key');
		expect(organisationIndex).toBeGreaterThan(-1);
		expect(productIndex).toBeGreaterThan(organisationIndex);
		expect(letGo).toBeGreaterThan(productIndex);
	});

	it('refuses a product of another organisation, and keeps every product’s pages out of a search of parts', () => {
		expect(statements).toContain('projects.organisation_id = new.organisation_id');
		const partsSearch = statements.slice(statements.indexOf('function public.search_business_brain_parts'));
		expect(partsSearch).toContain('page.project_id is null');
		expect(statements).toContain('order by page.project_id is null, ts_rank');
	});
});
