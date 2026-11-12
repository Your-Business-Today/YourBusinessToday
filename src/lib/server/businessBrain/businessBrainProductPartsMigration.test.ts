import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0201_business_brain_product_parts.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'business_brain')";
const managerRule = 'public.can_manage_organisation(organisation_id)';
const oldBrainTablePattern = /\bpublic\.(?:brain_\w+|domain_brains|knowledge_bases|kb_\w+|chatbots?\w*|hive_mind_\w+|workspace_\w+)\b/g;

describe('the product brain migration', () => {
	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
	});

	it('creates one table of its own, named business_brain, and names none of the old Brain tables', () => {
		expect([...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1])).toEqual([
			'business_brain_product_parts'
		]);
		expect(statements.match(oldBrainTablePattern) ?? []).toEqual([]);
	});

	it('puts the table behind the one module rule, and every write behind the manager rule too', () => {
		expect(statements).toContain('alter table public.business_brain_product_parts enable row level security;');
		const policies = statements.split('create policy').slice(1);
		expect(policies).toHaveLength(3);
		for (const policy of policies) expect(policy).toContain(moduleRule);
		for (const policy of policies.filter((policy) => !policy.includes('for select'))) expect(policy).toContain(managerRule);
	});

	it('ties a part only to a product of its own organisation, and keeps every tie on record', () => {
		expect(statements).toContain('projects.organisation_id = new.organisation_id');
		expect(statements).toContain('untying it is the only change');
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/for delete/i);
	});
});
