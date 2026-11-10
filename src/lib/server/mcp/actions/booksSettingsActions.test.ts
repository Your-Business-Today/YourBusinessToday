import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from './booksActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const organisationId = '00000000-0000-4000-8000-0000000000a1';

const switchedOnModules = vi.hoisted(() => ({ current: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => switchedOnModules.current }));

const blankDetails = { company_name: '', company_address: '', company_email: '', payment_instructions: '' };
const blankBank = { bank_account_name: '', bank_account_number: '', bank_sort_code: '' };
const numberingDefaults = { payment_terms_days: 30, financial_year_start_month: 4, invoice_prefix: 'INV', next_invoice_number: 1 };
const columnDefaults = { ...blankDetails, ...blankBank, ...numberingDefaults };
const books = { settingsRow: null as Record<string, unknown> | null, highestInvoice: null as { invoice_number: number } | null };
const upserts: Record<string, unknown>[] = [];
const booksDatabase = {
	from: (table: string) => {
		const answer = table === 'books_invoices' ? books.highestInvoice : books.settingsRow;
		const chain = {
			select: () => chain,
			eq: () => chain,
			order: () => chain,
			limit: () => chain,
			maybeSingle: () => chain,
			upsert: (row: Record<string, unknown>) => {
				upserts.push(row);
				books.settingsRow = { ...columnDefaults, ...books.settingsRow, ...row };
				return chain;
			},
			then: (resolve: (value: unknown) => unknown) => resolve({ data: answer, error: null })
		};
		return chain;
	}
};
const nigel = {
	accountId: 'nigel',
	isStaff: false,
	supabase: booksDatabase,
	organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }]
} as unknown as McpCaller;

const actionNamed = (name: string) => booksActions.find((action) => action.name === name) as McpAction;
const readSettings = actionNamed('read_books_settings');
const changeSettings = actionNamed('change_books_settings');

describe('the books settings actions', () => {
	beforeEach(() => {
		switchedOnModules.current = ['books'];
		books.settingsRow = null;
		books.highestInvoice = null;
		upserts.length = 0;
	});

	it('read and change nothing for an organisation without Books', async () => {
		switchedOnModules.current = [];
		expect(await readSettings.run(nigel, { organisationId })).toBe(moduleNotSwitchedOn('books'));
		expect(await changeSettings.run(nigel, { organisationId, invoicePrefix: 'JEW' })).toBe(moduleNotSwitchedOn('books'));
		expect(upserts).toEqual([]);
	});

	it('say plainly when no settings are saved yet', async () => {
		expect(await readSettings.run(nigel, { organisationId })).toContain("Jewel Enterprises's books hold no settings yet");
	});

	it('save only the settings given, for the organisation named', async () => {
		const answer = await changeSettings.run(nigel, { organisationId, invoicePrefix: 'JEW', paymentTermsDays: 14 });
		expect(upserts).toHaveLength(1);
		expect(upserts[0]).toMatchObject({ organisation_id: organisationId, invoice_prefix: 'JEW', payment_terms_days: 14 });
		expect(Object.keys(upserts[0]).sort()).toEqual(['invoice_prefix', 'organisation_id', 'payment_terms_days', 'updated_at']);
		expect(answer).toContain('Saved. Settings of Jewel Enterprises');
		expect(answer).toContain('- Invoice prefix JEW; the next invoice takes number 1');
		expect(answer).toContain('- The financial year starts in April');
	});

	it('refuse a value its column cannot hold, saving nothing', async () => {
		expect(await changeSettings.run(nigel, { organisationId, financialYearStartMonth: 0 })).toBe(
			'Nothing was saved. financialYearStartMonth is a whole number from 1 to 12; 0 was given.'
		);
		expect(upserts).toEqual([]);
	});

	it('refuse a next invoice number that would repeat one already used, saving nothing', async () => {
		books.highestInvoice = { invoice_number: 41 };
		expect(await changeSettings.run(nigel, { organisationId, nextInvoiceNumber: 41 })).toBe(
			'Nothing was saved. nextInvoiceNumber must be above 41, the highest invoice number already in these books, ' +
				'so no two invoices share a number; 41 was given.'
		);
		expect(upserts).toEqual([]);
	});
});
