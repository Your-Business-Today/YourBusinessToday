import { describe, expect, it } from 'vitest';
import { expectNothingTakenAway, expectTablesBehindModuleRule, expectTheShapeGuardFirst, readModuleMigration } from '$lib/server/migrations/moduleMigration.fixture';
import { CampaignLimits } from '$lib/brand/campaigns/campaignLimits';
import { campaignStatuses } from '$lib/brand/campaigns/campaign';

const migration = readModuleMigration('0177_brand_campaigns.sql', 'brand');
const { statements } = migration;
const yourBrandTodayTables = /\b(?:campaigns|campaign_pieces)\b/g;

describe('the brand campaigns migration', () => {
	it('creates only tables of its own, named brand_campaign', () => {
		expect(migration.createdTables).toEqual(['brand_campaigns', 'brand_campaign_pieces']);
	});

	it('names none of the tables yourbrand.today kept', () => {
		const withoutOwnNames = statements.replace(/brand_campaign\w*/g, '').replace(/"[^"]*"/g, '');
		expect(withoutOwnNames.match(yourBrandTodayTables) ?? []).toEqual([]);
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		expectTheShapeGuardFirst(migration);
	});

	it('holds the limits the door checks: the name, the budget, the dates and the statuses', () => {
		expect(statements).toContain(`check (char_length(name) between 1 and ${CampaignLimits.nameCharacters})`);
		expect(statements).toContain(`check (budget_pence between 0 and ${CampaignLimits.largestBudgetPence})`);
		expect(statements).toContain('check (ends_on >= starts_on)');
		expect(statements).toContain(`check (status in (${campaignStatuses.map((status) => `'${status}'`).join(', ')}))`);
	});

	it('turns on row level security on every table it creates, behind the one module rule', () => {
		expectTablesBehindModuleRule(migration);
	});

	it('deletes, drops and rewrites nothing', () => {
		expectNothingTakenAway(statements);
	});
});
