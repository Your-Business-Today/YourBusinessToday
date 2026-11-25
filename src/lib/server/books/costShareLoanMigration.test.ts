import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { costShareLoanPostingsTable } from './costShareLoanPostings';

const statements = readFileSync('migrations/0296_cost_share_directors_loan.sql', 'utf8').replace(/^--.*$/gm, '');

describe("migration 0296, a shared cost's part kept on a director's loan and the months moved there", () => {
	it('lets only a cost centre member name a loan account, and moves a member’s month once', () => {
		expect(statements).toContain('check (directors_loan_account_id is null or cost_centre_id is not null)');
		expect(statements).toContain('unique (cost_share_member_id, month)');
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		expect(statements).toContain(`alter table public.${costShareLoanPostingsTable} enable row level security;`);
		expect(tablesKeptByOrganisation).toContain(costShareLoanPostingsTable);
		expect(statements).not.toMatch(/create policy/);
	});

	it('only adds, and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b|\bdelete from\b|\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
	});
});
