import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0200_business_brain_chatbot_purpose.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'business_brain')";
const managerRule = 'public.can_manage_organisation(organisation_id)';

describe('the chatbot purpose migration', () => {
	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
	});

	it('adds the purpose to the chatbots already made, empty, and creates no table', () => {
		expect(statements).toContain("add column if not exists purpose text not null default ''");
		expect(statements).not.toMatch(/create table/i);
	});

	it('holds the limit the connector checks', () => {
		expect(statements).toContain(`char_length(purpose) <= ${businessBrainChatbotLimits.longestPurpose}`);
	});

	it('lets only a manager with the module change a chatbot, and only its purpose', () => {
		const [, updatePolicy] = statements.split('create policy');
		expect(updatePolicy).toContain('for update');
		expect(updatePolicy.split(moduleRule)).toHaveLength(3);
		expect(updatePolicy.split(managerRule)).toHaveLength(3);
		expect(statements).toContain("(to_jsonb(new) - 'purpose') <> (to_jsonb(old) - 'purpose')");
	});

	it('deletes nothing', () => {
		expect(statements).not.toMatch(/for delete/i);
		expect(statements).not.toMatch(/on delete cascade/i);
	});
});
