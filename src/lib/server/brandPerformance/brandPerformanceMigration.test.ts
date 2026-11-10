import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { countedFigures } from '$lib/brand/performance/performanceReading';
import { PerformanceLimits } from '$lib/brand/performance/performanceLimits';

const migration = readFileSync('migrations/0179_brand_performance_readings.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const moduleRule = "public.can_use_organisation_module(organisation_id, 'brand')";
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename)\b/i;
const reachAndAudience = /\b(?:reach|impressions|audience)\b/i;

function columnOf(figure: string): string {
	return figure.replace(/[A-Z]/g, (capital) => `_${capital.toLowerCase()}`);
}

describe('the brand performance readings migration', () => {
	it('creates one table of its own, named brand_performance_readings, and nothing of yourbrand.today', () => {
		expect([...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1])).toEqual([
			'brand_performance_readings'
		]);
		expect(statements.replace(/brand_performance_readings\w*/g, '')).not.toMatch(/\bperformance_readings\b/);
	});

	it('stops before creating anything when a table of the same name is there in another shape', () => {
		const guardAt = statements.indexOf('already exists in another shape');
		expect(guardAt).toBeGreaterThan(0);
		expect(guardAt).toBeLessThan(statements.indexOf('create table'));
	});

	it('holds every figure at nought or more, and spend to the limit the door checks', () => {
		for (const figure of countedFigures) {
			expect(statements).toContain(`${columnOf(figure)} integer not null default 0 check (${columnOf(figure)} >= 0)`);
		}
		expect(statements).toContain(`check (spend_pence between 0 and ${PerformanceLimits.largestSpendPence})`);
	});

	it('leaves reach, impressions and the audience to the paid campaign page step', () => {
		expect(statements).not.toMatch(reachAndAudience);
	});

	it('links a reading to the brand’s own piece and campaign, and turns on row level security behind the module rule', () => {
		expect(statements).toContain('references public.brand_content_pieces (id, organisation_id) on delete restrict');
		expect(statements).toContain('references public.brand_campaigns (id, organisation_id) on delete restrict');
		expect(statements).toContain('alter table public.brand_performance_readings enable row level security;');
		const policies = statements.split('create policy').slice(1);
		expect(policies.length).toBeGreaterThan(0);
		for (const policy of policies) expect(policy).toContain(moduleRule);
	});

	it('deletes, drops and rewrites nothing', () => {
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(destructiveStatement);
	});
});
