import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ageBands, genders } from '$lib/brand/audience/audienceBands';
import { PerformanceLimits } from '$lib/brand/performance/performanceLimits';

const migration = readFileSync('migrations/0180_brand_campaign_reach_and_audience.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'brand')";
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename|update)\b/i;

function listed(values: readonly string[]): string {
	return values.map((value) => `'${value}'`).join(', ');
}

describe('the campaign reach and audience migration', () => {
	it('adds impressions and reach to every reading, at nought for the readings already held', () => {
		for (const column of ['impressions', 'reach']) {
			expect(statements).toContain(`add column if not exists ${column} integer not null default 0 check (${column} >= 0)`);
		}
	});

	it('creates one table of its own, guarded against a table of the same name in another shape', () => {
		expect([...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1])).toEqual([
			'brand_campaign_audiences'
		]);
		const guardAt = statements.indexOf('already exists in another shape');
		expect(guardAt).toBeGreaterThan(0);
		expect(guardAt).toBeLessThan(statements.indexOf('create table'));
	});

	it('holds the age bands and genders the door checks, and spend to the same limit', () => {
		expect(statements).toContain(`check (age_band in (${listed(ageBands)}))`);
		expect(statements).toContain(`check (gender in (${listed(genders)}))`);
		expect(statements).toContain(`check (spend_pence between 0 and ${PerformanceLimits.largestSpendPence})`);
		expect(statements).toContain('unique (campaign_id, observed_on, age_band, gender)');
	});

	it('links an audience to the brand’s own campaign, behind the module rule', () => {
		expect(statements).toContain('references public.brand_campaigns (id, organisation_id) on delete restrict');
		expect(statements).toContain('alter table public.brand_campaign_audiences enable row level security;');
		const policies = statements.split('create policy').slice(1);
		expect(policies.length).toBeGreaterThan(0);
		for (const policy of policies) expect(policy).toContain(moduleRule);
	});

	it('deletes, drops and rewrites nothing', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(destructiveStatement);
	});
});
