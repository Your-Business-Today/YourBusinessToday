import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0161_business_brain_chatbots.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'business_brain')";
const managerRule = 'public.can_manage_organisation(organisation_id)';
const oldBrainTablePattern = /\bpublic\.(?:brain_\w+|domain_brains|knowledge_bases|kb_\w+|chatbots?\w*|hive_mind_\w+|workspace_\w+)\b/g;
const createdTablePattern = /create table if not exists public\.(\w+)/g;
const { longestName, shortestEmail, longestEmail } = businessBrainChatbotLimits;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

function policiesOn(table: string): string[] {
	return statements.split('create policy').slice(1).filter((policy) => policy.includes(`on public.${table}\n`));
}

describe('the Your Business Brain chatbots migration', () => {
	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
	});

	it('creates the chatbot, its parts and its members in tables of their own, named business_brain', () => {
		expect(createdTables()).toEqual(['business_brain_chatbots', 'business_brain_chatbot_parts', 'business_brain_chatbot_members']);
	});

	it('names none of the old Brain or chatbot tables', () => {
		expect(statements.match(oldBrainTablePattern) ?? []).toEqual([]);
	});

	it('puts every table behind the one module rule, and every write behind the manager rule too', () => {
		for (const table of createdTables()) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			const policies = policiesOn(table);
			expect(policies.length).toBeGreaterThan(1);
			for (const policy of policies) expect(policy).toContain(moduleRule);
			const writes = policies.filter((policy) => !policy.includes('for select'));
			for (const policy of writes) expect(policy).toContain(managerRule);
		}
	});

	it('deletes nothing: no cascade, and no policy that deletes a row', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/for delete/i);
	});

	it('holds the limits the connector checks', () => {
		expect(statements).toContain(`char_length(name) between 1 and ${longestName}`);
		expect(statements).toContain(`char_length(email) between ${shortestEmail} and ${longestEmail}`);
		expect(statements).toContain('email = lower(email)');
	});
});
