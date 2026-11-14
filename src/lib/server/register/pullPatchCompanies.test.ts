import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { pullPatchCompanies } from './pullPatchCompanies';
import { companiesHouseAnswering, searchAnswer, searchedCompany } from '$lib/server/companiesHouse/companiesHouseAnswers.fixture';
import type { Patch } from '$lib/server/patches/patchRecord';

const key = vi.hoisted(() => ({ value: 'test-key' }));
vi.mock('$env/dynamic/private', () => ({ env: { get COMPANIES_HOUSE_API_KEY() { return key.value; } } }));

const writtenCompanyNumbers: string[] = [];
const sutton = { id: 'patch-1', name: 'Sutton', outcodes: ['SM1', 'SM2', 'SM3'], sicCodes: [] } as unknown as Patch;
const freshStart = { resumeMarker: '', wasLastRunFinished: true };
const noProgress = async () => {};

function database(): SupabaseClient {
	const rpc = async (_name: string, parameters: { rows: { company_number: string }[] }) => {
		writtenCompanyNumbers.push(...parameters.rows.map((row) => row.company_number));
		return { error: null };
	};
	return { rpc } as unknown as SupabaseClient;
}

function oneCompanyPerOutcode() {
	return companiesHouseAnswering((address) => {
		const outcode = address.searchParams.get('location') ?? '';
		return searchAnswer([searchedCompany(`${outcode}-1`, `${outcode} 1AA`, '2020-01-01')]);
	});
}

beforeEach(() => {
	writtenCompanyNumbers.length = 0;
	key.value = 'test-key';
	vi.stubGlobal('fetch', oneCompanyPerOutcode());
});
afterEach(() => vi.unstubAllGlobals());

describe("pulling a patch's companies", () => {
	it('pulls every outcode and says how many each held', async () => {
		const outcome = await pullPatchCompanies(database(), sutton, freshStart, noProgress);
		expect(outcome.isFinished).toBe(true);
		expect(outcome.rowsWritten).toBe(3);
		expect(outcome.note).toBe('Every outcode pulled. SM1 1 in 1 search; SM2 1 in 1 search; SM3 1 in 1 search.');
	});

	it('carries on at the next outcode after a run cut off half way, writing no company twice', async () => {
		const cutOffAfterSm1 = { resumeMarker: 'SM1', wasLastRunFinished: false };
		await pullPatchCompanies(database(), sutton, cutOffAfterSm1, noProgress);
		expect(writtenCompanyNumbers).toEqual(['SM2-1', 'SM3-1']);
	});

	it('marks each outcode as it finishes, so a cut-off run knows where it stopped', async () => {
		const markers: string[] = [];
		await pullPatchCompanies(database(), sutton, freshStart, async (marker) => void markers.push(marker));
		expect(markers).toEqual(['SM1', 'SM2', 'SM3']);
	});

	it('says so and does nothing without the key', async () => {
		key.value = '';
		const outcome = await pullPatchCompanies(database(), sutton, freshStart, noProgress);
		expect(outcome.rowsWritten).toBe(0);
		expect(outcome.note).toMatch(/not configured/);
		expect(writtenCompanyNumbers).toEqual([]);
	});
});
