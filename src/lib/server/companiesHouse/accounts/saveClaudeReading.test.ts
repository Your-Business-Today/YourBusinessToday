import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { accountsFilingAnswer, accountsWorld, taggedAccounts } from './accountsAnswers.fixture';
import { accountsReadingRowOf } from '$lib/server/register/accountsReadingRecord';
import { describeAccountsReading } from '$lib/data/accountsReadingAnswer';
import { noAccountsToRead, saveClaudeReading, taggedFiguresStand } from './saveClaudeReading';
import { noFilingsAnswer } from './accountsAnswers.fixture';
import type { AccountsReading } from '$lib/data/accountsReadingRules';

vi.mock('$env/dynamic/private', () => ({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' } }));

const companyNumber = '33333333';
const page = `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}/filing-history/transaction-doc-4/document?format=pdf&download=0`;
const sent = { madeUpTo: '2026-03-31', cash: 18_250, currentAssets: 40_000, page };
const reader = 'reader-account';

function readingsTable(stored: AccountsReading | null, saved: Record<string, unknown>[]): SupabaseClient {
	const row = stored === null ? null : accountsReadingRowOf(stored);
	const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: row, error: null }), upsert: async (written: Record<string, unknown>) => (saved.push(written), { error: null }) };
	return { from: () => query } as unknown as SupabaseClient;
}

function companiesHouseWith(documents: Record<string, string>, hasFiled = true) {
	vi.stubGlobal('fetch', accountsWorld(hasFiled ? () => accountsFilingAnswer('total-exemption-full', 'doc-4') : noFilingsAnswer, documents, []));
}

afterEach(() => vi.unstubAllGlobals());

describe('saving a cash figure read from a PDF', () => {
	it("keeps the figure, marked as read by that person's Claude on the page it was read on", async () => {
		companiesHouseWith({});
		const saved: Record<string, unknown>[] = [];
		const reading = await saveClaudeReading(readingsTable(null, saved), companyNumber, sent, reader);
		expect(saved[0]).toMatchObject({ cash: 18_250, current_assets: 40_000, read_method: 'read_by_claude', read_by_account_id: reader, read_page: page });
		expect(describeAccountsReading(reading as AccountsReading)).toContain("Read from the PDF by a staff member's Claude");
	});

	it('refuses a made-up date that is not the date of the latest accounts, naming it', async () => {
		companiesHouseWith({});
		const answer = await saveClaudeReading(readingsTable(null, []), companyNumber, { ...sent, madeUpTo: '2025-03-31' }, reader);
		expect(answer).toContain('madeUpTo must be 2026-03-31');
	});

	it("refuses a page that is not the company's own document", async () => {
		companiesHouseWith({});
		const answer = await saveClaudeReading(readingsTable(null, []), companyNumber, { ...sent, page: 'https://example.com/accounts.pdf' }, reader);
		expect(answer).toContain("page must be the company's own document page");
	});

	it('refuses to replace accounts that carry tagged figures', async () => {
		companiesHouseWith({ 'doc-4': taggedAccounts });
		expect(await saveClaudeReading(readingsTable(null, []), companyNumber, sent, reader)).toBe(taggedFiguresStand);
	});

	it('refuses a company that has filed no accounts', async () => {
		companiesHouseWith({}, false);
		expect(await saveClaudeReading(readingsTable(null, []), companyNumber, sent, reader)).toBe(noAccountsToRead);
	});

	it('refuses an amount beyond its column', async () => {
		companiesHouseWith({});
		expect(await saveClaudeReading(readingsTable(null, []), companyNumber, { ...sent, cash: 1e15 }, reader)).toContain('cash is beyond');
	});
});
