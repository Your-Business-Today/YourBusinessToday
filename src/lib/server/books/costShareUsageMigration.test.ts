import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CostShareSplitBy } from '$lib/data/books/sharing/costShareUsage';
import { CostShareUsageLimits } from '$lib/data/books/sharing/costShareUsageRules';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { costShareUsageTable } from './costShareUsageReadings';

const statements = readFileSync('migrations/0295_cost_share_usage_split.sql', 'utf8').replace(/^--.*$/gm, '');

describe('migration 0295, shared costs split by usage and the readings they are split by', () => {
	it('holds the same choices and limits as the rules, one reading to a project in a month', () => {
		const choices = Object.values(CostShareSplitBy).map((choice) => `'${choice}'`);
		expect(statements).toContain(`check (split_by in (${choices.join(', ')}))`);
		expect(statements).toContain(`numeric(14, ${CostShareUsageLimits.decimalPlaces}) not null check (usage >= 0 and usage <= ${CostShareUsageLimits.largestUsage})`);
		expect(statements).toContain('unique nulls not distinct (cost_share_id, month, project_id, cost_centre_id)');
		expect(statements).toContain('check (project_id is null or cost_centre_id is null)');
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		expect(statements).toContain(`alter table public.${costShareUsageTable} enable row level security;`);
		expect(tablesKeptByOrganisation).toContain(costShareUsageTable);
		expect(statements).not.toMatch(/create policy/);
	});

	it('only adds, and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b|\bdelete from\b|\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
	});
});
