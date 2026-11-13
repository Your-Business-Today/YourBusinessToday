import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { findFinancialYear } from './financialYear';

const organisation = '00000000-0000-4000-8000-0000000000a1';
const columnNotThereYet = { code: '42703', message: 'column books_settings.first_period_start does not exist' };
type Answer = { data: unknown; error: unknown };

function settingsAnswering(answers: Answer[]) {
	const selected: string[] = [];
	const from = () => {
		const chain = {
			select: (columns: string) => {
				selected.push(columns);
				return chain;
			},
			eq: () => chain,
			maybeSingle: () => chain,
			then: (resolve: (value: unknown) => unknown) => resolve(answers[selected.length - 1])
		};
		return chain;
	};
	return { supabase: { from } as unknown as SupabaseClient, selected };
}

describe('findFinancialYear', () => {
	it('reads the start month and the first accounting period together', async () => {
		const row = { financial_year_start_month: 8, first_period_start: '2026-07-09', first_period_end: '2027-07-31' };
		const { supabase } = settingsAnswering([{ data: row, error: null }]);
		expect(await findFinancialYear(supabase, organisation)).toEqual({
			startMonth: 8,
			firstPeriod: { start: '2026-07-09', end: '2027-07-31' }
		});
	});

	it('reads no first period when none is set, and the default month when nothing is saved', async () => {
		const row = { financial_year_start_month: 1, first_period_start: null, first_period_end: null };
		expect(await findFinancialYear(settingsAnswering([{ data: row, error: null }]).supabase, organisation)).toEqual({
			startMonth: 1,
			firstPeriod: null
		});
		expect(await findFinancialYear(settingsAnswering([{ data: null, error: null }]).supabase, organisation)).toEqual({
			startMonth: 4,
			firstPeriod: null
		});
	});

	it('reads the start month alone as before while migration 0218 has not run', async () => {
		const answers = [
			{ data: null, error: columnNotThereYet },
			{ data: { financial_year_start_month: 8 }, error: null }
		];
		const { supabase, selected } = settingsAnswering(answers);
		expect(await findFinancialYear(supabase, organisation)).toEqual({ startMonth: 8, firstPeriod: null });
		expect(selected).toEqual(['financial_year_start_month, first_period_start, first_period_end', 'financial_year_start_month']);
	});
});
