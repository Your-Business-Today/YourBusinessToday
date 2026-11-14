import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { watchOutcode } from './watchOutcode';
import { watchRegister } from './watchRegister';
import { companiesHouseAnswering, refusalAnswer, searchAnswer, searchedCompany } from '$lib/server/companiesHouse/companiesHouseAnswers.fixture';

vi.mock('$env/dynamic/private', () => ({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' } }));

const noCompaniesFound = 404;
const sinceDay = '2026-11-11';
const writes: { name: string; rows: unknown[] }[] = [];

function databaseWithOutcodes(outcodes: string[]): SupabaseClient {
	const patchOutcodes = { select: async () => ({ data: outcodes.map((outcode) => ({ outcode })), error: null }) };
	const rpc = async (name: string, parameters: { rows?: unknown[] }) => (writes.push({ name, rows: parameters.rows ?? [] }), { error: null });
	return { from: () => patchOutcodes, rpc } as unknown as SupabaseClient;
}

function isIncorporatedSearch(address: URL): boolean {
	return address.searchParams.has('incorporated_from');
}

function answerIncorporatedIn(outcodesWithNewCompanies: string[]) {
	return companiesHouseAnswering((address) => {
		const outcode = address.searchParams.get('location') ?? '';
		const isAnswered = isIncorporatedSearch(address) && outcodesWithNewCompanies.includes(outcode);
		if (!isAnswered) return refusalAnswer(noCompaniesFound);
		return searchAnswer([searchedCompany(`${outcode}-1`, `${outcode} 1AA`, '2026-11-12')]);
	});
}

beforeEach(() => (writes.length = 0));
afterEach(() => vi.unstubAllGlobals());

describe('watching an outcode when a search finds no company', () => {
	it('writes and counts the companies the other searches found', async () => {
		vi.stubGlobal('fetch', answerIncorporatedIn(['KT1']));
		expect(await watchOutcode(databaseWithOutcodes([]), 'KT1', [], sinceDay)).toBe(1);
		expect(writes.find((write) => write.name === 'upsert_watched_companies')?.rows).toHaveLength(1);
	});

	it('counts nothing and writes nothing when no search finds a company', async () => {
		vi.stubGlobal('fetch', answerIncorporatedIn([]));
		expect(await watchOutcode(databaseWithOutcodes([]), 'KT1', [], sinceDay)).toBe(0);
		expect(writes).toEqual([]);
	});

	it('lets the register watch run through an outcode with nothing new', async () => {
		vi.stubGlobal('fetch', answerIncorporatedIn(['KT2']));
		const start = { resumeMarker: '', wasLastRunFinished: true };
		const outcome = await watchRegister(databaseWithOutcodes(['KT1', 'KT2']), start, async () => {});
		expect(outcome.isFinished).toBe(true);
		expect(outcome.rowsWritten).toBe(1);
		expect(outcome.note).toMatch(/^Checked 2 outcodes since \d{4}-\d{2}-\d{2}\.$/);
	});
});
