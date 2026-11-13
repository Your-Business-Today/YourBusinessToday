import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from './booksActions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const organisationId = '00000000-0000-4000-8000-0000000000a1';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const augustYearStart = { company_name: 'Your Business Today Ltd', invoice_prefix: 'INV', next_invoice_number: 4, financial_year_start_month: 8 };
const noFirstPeriod = { first_period_start: null, first_period_end: null };
const books = { settingsRow: null as Record<string, unknown> | null };
const upserts: Record<string, unknown>[] = [];
const booksDatabase = {
	from: (table: string) => {
		const answer = table === 'books_invoices' ? null : books.settingsRow;
		const chain = {
			select: () => chain,
			eq: () => chain,
			order: () => chain,
			limit: () => chain,
			maybeSingle: () => chain,
			upsert: (row: Record<string, unknown>) => {
				upserts.push(row);
				books.settingsRow = { ...books.settingsRow, ...row };
				return chain;
			},
			then: (resolve: (value: unknown) => unknown) => resolve({ data: answer, error: null })
		};
		return chain;
	}
};
const james = { accountId: 'james', isStaff: true, supabase: booksDatabase, organisationMemberships: [] } as unknown as McpCaller;

const changeSettings = booksActions.find((action) => action.name === 'change_books_settings') as McpAction;
const readSettings = booksActions.find((action) => action.name === 'read_books_settings') as McpAction;
const firstAccounts = { firstPeriodStart: '2026-07-09', firstPeriodEnd: '2027-07-31' };

describe("the books settings' first accounting period", () => {
	beforeEach(() => {
		books.settingsRow = { ...augustYearStart, ...noFirstPeriod };
		upserts.length = 0;
	});

	it('saves the first period and reads it back', async () => {
		const answer = await changeSettings.run(james, { organisationId, ...firstAccounts });
		expect(upserts[0]).toMatchObject({ first_period_start: '2026-07-09', first_period_end: '2027-07-31' });
		expect(answer).toContain('- First accounting period: 9 Jul 2026 to 31 Jul 2027; a year to date up to its last day starts on 9 Jul 2026');
		expect(await readSettings.run(james, { organisationId })).toContain('First accounting period: 9 Jul 2026 to 31 Jul 2027');
	});

	it('says when no first period is set', async () => {
		expect(await readSettings.run(james, { organisationId })).toContain('- First accounting period: not set');
	});

	it('refuses a first period whose end is not the day before the saved year starts, saving nothing', async () => {
		const answer = await changeSettings.run(james, { organisationId, firstPeriodStart: '2026-07-09', firstPeriodEnd: '2027-06-30' });
		expect(answer).toBe(
			'Nothing was saved. firstPeriodEnd is the day before a financial year starts: the last day of July, ' +
				'as the year starts in August; 2027-06-30 was given.'
		);
		expect(upserts).toEqual([]);
	});

	it('refuses a new start month the saved first period does not end before, saving nothing', async () => {
		books.settingsRow = { ...augustYearStart, first_period_start: '2026-07-09', first_period_end: '2027-07-31' };
		const answer = await changeSettings.run(james, { organisationId, financialYearStartMonth: 4 });
		expect(answer).toMatch(/^Nothing was saved\. firstPeriodEnd is the day before a financial year starts: the last day of March/);
		expect(upserts).toEqual([]);
	});

	it('clears the first period with two nulls', async () => {
		books.settingsRow = { ...augustYearStart, first_period_start: '2026-07-09', first_period_end: '2027-07-31' };
		await changeSettings.run(james, { organisationId, firstPeriodStart: null, firstPeriodEnd: null });
		expect(upserts[0]).toMatchObject(noFirstPeriod);
	});
});
