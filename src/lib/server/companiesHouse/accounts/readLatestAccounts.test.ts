import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountsFilingAnswer, accountsWorld, microEntityAccounts, noFilingsAnswer, taggedAccounts } from './accountsAnswers.fixture';
import { describeAccountsReading } from '$lib/data/accountsReadingAnswer';
import { readLatestAccounts } from './readLatestAccounts';

vi.mock('$env/dynamic/private', () => ({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' } }));

const mostCallsForOneCompany = 3;

function companiesHouseHolding(accountsType: string | null, documentId: string, taggedDocuments: Record<string, string>, calls: string[] = []) {
	const filing = accountsType === null ? noFilingsAnswer : () => accountsFilingAnswer(accountsType, documentId);
	vi.stubGlobal('fetch', accountsWorld(filing, taggedDocuments, calls));
}

afterEach(() => vi.unstubAllGlobals());

describe("reading a company's latest accounts", () => {
	it('states the cash, the accounts type and the made-up date, in at most three calls', async () => {
		const calls: string[] = [];
		companiesHouseHolding('total-exemption-full', 'doc-1', { 'doc-1': taggedAccounts }, calls);
		const reading = await readLatestAccounts('12345678', null);
		expect(reading).toMatchObject({ outcome: 'cash_stated', cash: 12_000, madeUpTo: '2026-03-31', accountsType: 'total-exemption-full', readMethod: 'tagged_figures' });
		expect(describeAccountsReading(reading)).toContain('Cash at bank £12k on 31 Mar 2026');
		expect(calls.filter((call) => !call.startsWith('storage.example')).length).toBeLessThanOrEqual(mostCallsForOneCompany);
	});

	it("says a micro-entity's cash is not stated, with the current assets it cannot exceed", async () => {
		companiesHouseHolding('micro-entity', 'doc-2', { 'doc-2': microEntityAccounts });
		const reading = await readLatestAccounts('87654321', null);
		expect(reading).toMatchObject({ outcome: 'cash_not_stated', cash: null, currentAssets: 45_300 });
		expect(describeAccountsReading(reading)).toContain('Current assets were £45k, which the cash cannot exceed.');
	});

	it('says a company is dormant without reading its document', async () => {
		const calls: string[] = [];
		companiesHouseHolding('dormant', 'doc-3', {}, calls);
		const reading = await readLatestAccounts('11111111', null);
		expect(reading.outcome).toBe('dormant');
		expect(calls).toHaveLength(1);
	});

	it('says no accounts are filed yet', async () => {
		companiesHouseHolding(null, '', {});
		expect(describeAccountsReading(await readLatestAccounts('22222222', null))).toBe('22222222: No accounts filed yet.');
	});

	it('gives the public page of accounts filed only as a PDF', async () => {
		companiesHouseHolding('total-exemption-full', 'doc-4', {});
		const reading = await readLatestAccounts('33333333', null);
		expect(reading.outcome).toBe('pdf_only');
		expect(reading.documentUrl).toBe('https://find-and-update.company-information.service.gov.uk/company/33333333/filing-history/transaction-doc-4/document?format=pdf&download=0');
	});

	it('reuses the stored reading until newer accounts are filed', async () => {
		const calls: string[] = [];
		companiesHouseHolding('total-exemption-full', 'doc-1', { 'doc-1': taggedAccounts }, calls);
		const stored = await readLatestAccounts('12345678', null);
		calls.length = 0;
		expect(await readLatestAccounts('12345678', stored)).toBe(stored);
		expect(calls).toHaveLength(1);
	});
});
