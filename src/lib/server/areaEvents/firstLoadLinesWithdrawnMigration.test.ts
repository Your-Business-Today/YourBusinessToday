import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0254_first_load_lines_withdrawn_from_the_feed.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const sutton = '14a286e4-08d5-474b-ac97-deb49e953c75';
const surbiton = '02d731bf-8d5e-40c9-82ac-3d84d387e945';

describe('the migration that withdraws the lines two first loads wrote as news', () => {
	it('takes away no data: it deletes nothing and only adds a column with a default', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements).toContain('alter table public.area_events add column if not exists is_withdrawn boolean not null default false');
		expect(statements.match(/alter table/g)).toHaveLength(1);
	});

	it('marks lines on the outcodes of Sutton and Surbiton alone', () => {
		expect(statements.match(new RegExp(`patch_id in \\('${sutton}', '${surbiton}'\\)`, 'g'))).toHaveLength(2);
		expect(statements.match(/and line\.outcode in \(select outcode from sutton_and_surbiton\)/g)).toHaveLength(2);
	});

	it("withdraws an arrival only for a premises that is not a later arrival, tied to it by the line's key", () => {
		expect(statements).toMatch(
			/line\.kind = 'premises_opened'[\s\S]+line\.source_key = public\.premises_change_key\('premises_opened', listed, line\.happened_at\)\s+and not listed\.is_later_arrival;/
		);
	});

	it('withdraws a holding company line only when the company was not newly incorporated, by the test the trigger now uses', () => {
		expect(statements).toMatch(
			/line\.kind = 'holding_company_over_trading'[\s\S]+\(company\.incorporated_on is null or company\.incorporated_on < line\.happened_at - public\.register_new_company_days\(\)\);/
		);
	});

	it('withdraws nothing on a second run, and says how many it withdrew', () => {
		expect(statements.match(/and not line\.is_withdrawn/g)).toHaveLength(2);
		expect(statements).toContain("raise notice 'Withdrawn from the feed:");
		expect(statements.trim().startsWith('begin;')).toBe(true);
	});
});
