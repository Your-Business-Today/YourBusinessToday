import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import { chatbotRecordDeletionReasons, chatbotRecordKeepingLimits } from '$lib/data/chatbotRecordKeepingRules';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0292_business_brain_chatbot_record_deletions.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'business_brain')";
const managerRule = 'public.can_manage_organisation(organisation_id)';
const newTables = ['business_brain_chatbot_record_keeping', 'business_brain_chatbot_record_deletions'];
const { shortestKeptDays, longestKeptDays } = chatbotRecordKeepingLimits;
const reasons = Object.values(chatbotRecordDeletionReasons);

function policiesOn(table: string): string[] {
	return statements.split('create policy').slice(1).filter((policy) => policy.includes(`on public.${table}\n`));
}

function bodyOf(functionName: string): string {
	const [, afterName = ''] = statements.split(`function public.${functionName}(`);
	const [, body = ''] = afterName.split('$$');
	return body;
}

describe('deleting from a chatbot record and setting how long it is kept', () => {
	it('takes away nothing already there as it runs, and sets timeouts so it never holds a lock for long', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements).toContain("set local lock_timeout = '10s';");
		expect(statements).toContain("set local statement_timeout = '2min';");
	});

	it('still refuses every change to an entry, and lets a delete through only while a question is being forgotten', () => {
		const kept = bodyOf('business_brain_chatbot_trail_is_kept');
		expect(kept).toContain("tg_op = 'DELETE' and current_setting('ybt.forgetting_chatbot_question', true) = 'yes'");
		expect(kept).toContain('raise exception');
		const forget = bodyOf('forget_chatbot_question');
		expect(forget).toContain("set_config('ybt.forgetting_chatbot_question', 'yes', true)");
		expect(forget).toContain("set_config('ybt.forgetting_chatbot_question', '', true)");
		expect(forget).toContain('insert into public.business_brain_chatbot_record_deletions');
	});

	it('keeps the deletions as written, without the words deleted', () => {
		expect(statements).toContain(
			'before update or delete on public.business_brain_chatbot_record_deletions\n\tfor each row execute function public.business_brain_chatbot_deletions_are_kept();'
		);
		const [, deletionsTable = ''] = statements.split('create table if not exists public.business_brain_chatbot_record_deletions');
		const [columns] = deletionsTable.split(');');
		expect(columns).not.toMatch(/\b(?:question|answer)\s+text\b/);
	});

	it('lets nobody but the owner call the step that forgets, and only the service role run the overnight deletion', () => {
		expect(statements).toContain('revoke execute on function public.forget_chatbot_question(uuid, uuid, text) from public, anon, authenticated, service_role;');
		expect(statements).toContain('grant execute on function public.delete_chatbot_record_past_keeping(integer) to service_role;');
		expect(statements).not.toMatch(/grant execute on function public\.delete_chatbot_record_past_keeping\(integer\) to [^;]*authenticated/);
	});

	it('lets a manager with the module read the keeping period and the deletions, and nobody write them from the app', () => {
		for (const table of newTables) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			const policies = policiesOn(table);
			expect(policies).toHaveLength(1);
			expect(policies[0]).toContain('for select');
			expect(policies[0]).toContain(moduleRule);
			expect(policies[0]).toContain(managerRule);
		}
		expect(statements).not.toMatch(/for (?:insert|update|delete|all)/i);
	});

	it('mirrors the limits the site and the connector check before they write', () => {
		expect(statements).toContain(`kept_days between ${shortestKeptDays} and ${longestKeptDays}`);
		expect(statements).toContain(`char_length(deleted_by_email) between 3 and ${businessBrainChatbotLimits.longestEmail}`);
		expect(statements).toContain(`reason in (${reasons.map((reason) => `'${reason}'`).join(', ')})`);
	});
});
