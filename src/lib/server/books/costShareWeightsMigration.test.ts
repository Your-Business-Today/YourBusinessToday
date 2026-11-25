import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CostShareWeightLimits, equalWeight } from '$lib/data/books/sharing/costShareWeights';

const statements = readFileSync('migrations/0294_cost_share_member_weights.sql', 'utf8').replace(/^--.*$/gm, '');

describe('migration 0294, the weight each project sharing a cost carries', () => {
	it('holds the same limits as the rules, every member kept so far taking the equal weight', () => {
		const { largestWeight, decimalPlaces } = CostShareWeightLimits;
		expect(statements).toContain(`numeric(12, ${decimalPlaces}) not null default ${equalWeight} check (weight > 0 and weight <= ${largestWeight})`);
	});

	it('only adds, and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b|\bdelete from\b|\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
	});
});
