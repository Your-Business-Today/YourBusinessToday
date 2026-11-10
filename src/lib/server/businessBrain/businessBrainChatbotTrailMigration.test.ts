import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chatbotTrailLimits } from '$lib/data/businessBrainChatbotTrailRules';
import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import { businessBrainReadLimits, businessBrainPartKinds } from '$lib/data/businessBrainRules';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0175_business_brain_chatbot_questions.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'business_brain')";
const managerRule = 'public.can_manage_organisation(organisation_id)';
const oldBrainTablePattern = /\bpublic\.(?:brain_\w+|domain_brains|knowledge_bases|kb_\w+|chatbots?\w*|hive_mind_\w+|workspace_\w+)\b/g;
const createdTablePattern = /create table if not exists public\.(\w+)/g;
const trailTables = ['business_brain_chatbot_questions', 'business_brain_chatbot_readings', 'business_brain_chatbot_answers'];
const { longestQuestion, longestAnswer, longestRefusal, mostPagesCited } = chatbotTrailLimits;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

function policiesOn(table: string): string[] {
	return statements.split('create policy').slice(1).filter((policy) => policy.includes(`on public.${table}\n`));
}

describe('the record of questions asked through a chatbot', () => {
	it('takes away nothing already there, and names none of the old Brain or chatbot tables', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements.match(oldBrainTablePattern) ?? []).toEqual([]);
	});

	it('keeps the questions, the readings Your Business Today saw and the answers reported in tables of their own', () => {
		expect(createdTables()).toEqual(trailTables);
	});

	it('refuses every change and every delete of a row, whoever makes it', () => {
		for (const table of trailTables) {
			expect(statements).toContain(`before update or delete on public.${table}\n\tfor each row execute function public.business_brain_chatbot_trail_is_kept();`);
		}
		expect(statements).toMatch(/raise exception 'The record of questions asked through a chatbot is kept as it was written/);
	});

	it('lets a manager with the module read it, and nobody write, change or delete it from the app', () => {
		for (const table of trailTables) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			const policies = policiesOn(table);
			expect(policies).toHaveLength(1);
			expect(policies[0]).toContain('for select');
			expect(policies[0]).toContain(moduleRule);
			expect(policies[0]).toContain(managerRule);
		}
		expect(statements).not.toMatch(/for (?:insert|update|delete|all)/i);
	});

	it('deletes nothing by a cascade, and keeps the asker without a key that would empty their rows', () => {
		expect(statements).not.toMatch(/on delete (?:cascade|set null)/i);
		expect(statements).not.toMatch(/references auth\.users/);
	});

	it('mirrors the limits the connector checks before it writes', () => {
		expect(statements).toContain(`char_length(question) between 1 and ${longestQuestion}`);
		expect(statements).toContain(`char_length(answer) between 1 and ${longestAnswer}`);
		expect(statements).toContain(`char_length(refusal) <= ${longestRefusal}`);
		expect(statements).toContain(`jsonb_array_length(pages_cited) <= ${mostPagesCited}`);
		expect(statements).toContain(`char_length(search_words) <= ${businessBrainReadLimits.longestSearch}`);
		expect(statements).toContain(`char_length(asked_by_email) between 3 and ${businessBrainChatbotLimits.longestEmail}`);
		expect(statements).toContain(`part_kind in (${businessBrainPartKinds.map((kind) => `'${kind}'`).join(', ')})`);
	});
});
