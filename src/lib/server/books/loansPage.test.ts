import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from '$lib/server/mcp/actions/booksActions';
import { holdThreePartnersLoans, loanOrganisationId as organisationId } from '$lib/server/mcp/actions/booksLoanWorld.fixture';
import { loanDatabase } from '$lib/server/mcp/actions/booksLoanSteps.fixture';
import type { McpAction } from '$lib/server/mcp/actionTypes';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readLoanRows } from './loansPage';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const nigel = {
	accountId: 'nigel',
	isStaff: false,
	supabase: loanDatabase,
	organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }]
} as unknown as McpCaller;

const openLoanAccount = (personName: string, relationship: string, accountCode: string) =>
	(booksActions.find((action) => action.name === 'open_loan_account') as McpAction).run(nigel, { organisationId, personName, relationship, accountCode });

const readRows = () => readLoanRows(loanDatabase as unknown as SupabaseClient, organisationId, '2026-11-13');

describe('the Loans page', () => {
	beforeEach(async () => {
		holdThreePartnersLoans();
		await openLoanAccount('James Beadle', 'director', '2300');
		await openLoanAccount('Nigel Reilly', 'director', '2310');
	});

	it("lists each person's loan account with who owes whom in words and the day it last moved", async () => {
		const rows = await readRows();
		expect(rows.map((row) => [row.personName, row.relationship, row.owedInWords])).toEqual([
			['James Beadle', 'director', 'James Beadle owes the company £69.25.'],
			['Nigel Reilly', 'director', 'The company owes Nigel Reilly £550.00.']
		]);
		const [james] = rows;
		const { lines } = james.statement;
		const lastEntry = lines.at(-1);
		expect(james.lastMovement).toBe(lastEntry?.journalDate);
	});

	it("carries each person's statement, with the stretches it was overdrawn, so a row opens with no page load", async () => {
		const [james] = await readRows();
		const { statement } = james;
		expect(statement.overdrawnStretches).toEqual([
			{ from: '2026-08-20', to: '2026-09-02', mostOwed: 119.25 },
			{ from: '2026-10-05', to: null, mostOwed: 69.25 }
		]);
	});
});
