import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CostShareLimits } from '$lib/data/books/sharing/costShare';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { CostShareTables, costShareColumns, costShareMemberColumns } from './costShares';

const migration = readFileSync('migrations/0291_books_cost_shares.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');
const columnsAddedLater = readFileSync('migrations/0292_cost_shares_by_project_status.sql', 'utf8');
const columnsOf = (list: string) => list.split(', ').filter((column) => column !== 'id');

describe('migration 0291, the shared costs and the projects that share them, and the limits the connector checks', () => {
	it('holds the same months as the rules, with every column the site reads', () => {
		const { fewestMonthsCovered, mostMonthsCovered } = CostShareLimits;
		expect(statements).toContain(`check (months_covered between ${fewestMonthsCovered} and ${mostMonthsCovered})`);
		for (const column of [...columnsOf(costShareColumns), ...columnsOf(costShareMemberColumns)]) expect(`${statements}${columnsAddedLater}`).toMatch(new RegExp(`\\n\\t(add column if not exists )?${column} `));
	});

	it('keeps each month as its first day, and a month left never before the month joined', () => {
		expect(statements).toContain('check (extract(day from joined_month) = 1)');
		expect(statements).toContain('check (left_month is null or left_month >= joined_month)');
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		for (const table of Object.values(CostShareTables)) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			expect(tablesKeptByOrganisation).toContain(table);
		}
		expect(statements).not.toMatch(/create policy/);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
	});
});
