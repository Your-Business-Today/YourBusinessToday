import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CampaignLimits } from '$lib/brand/campaigns/campaignLimits';
import { campaignStatuses } from '$lib/brand/campaigns/campaign';

const migration = readFileSync('migrations/0177_brand_campaigns.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'brand')";
const yourBrandTodayTables = /\b(?:campaigns|campaign_pieces)\b/g;
const createdTablePattern = /create table if not exists public\.(\w+)/g;
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename)\b/i;

function createdTables(): string[] {
	return [...statements.matchAll(createdTablePattern)].map((match) => match[1]);
}

describe('the brand campaigns migration', () => {
	it('creates only tables of its own, named brand_campaign', () => {
		expect(createdTables()).toEqual(['brand_campaigns', 'brand_campaign_pieces']);
	});

	it('names none of the tables yourbrand.today kept', () => {
		const withoutOwnNames = statements.replace(/brand_campaign\w*/g, '').replace(/"[^"]*"/g, '');
		expect(withoutOwnNames.match(yourBrandTodayTables) ?? []).toEqual([]);
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		const guardAt = statements.indexOf('already exists in another shape');
		expect(guardAt).toBeGreaterThan(0);
		expect(guardAt).toBeLessThan(statements.indexOf('create table'));
	});

	it('holds the limits the door checks: the name, the budget, the dates and the statuses', () => {
		expect(statements).toContain(`check (char_length(name) between 1 and ${CampaignLimits.nameCharacters})`);
		expect(statements).toContain(`check (budget_pence between 0 and ${CampaignLimits.largestBudgetPence})`);
		expect(statements).toContain('check (ends_on >= starts_on)');
		expect(statements).toContain(`check (status in (${campaignStatuses.map((status) => `'${status}'`).join(', ')}))`);
	});

	it('turns on row level security on every table it creates, behind the one module rule', () => {
		for (const table of createdTables()) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			const policies = statements.split('create policy').filter((policy) => policy.includes(`on public.${table}\n`));
			expect(policies.length).toBeGreaterThan(0);
			for (const policy of policies) expect(policy).toContain(moduleRule);
		}
	});

	it('deletes, drops and rewrites nothing', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(destructiveStatement);
	});
});
