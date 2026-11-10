import { readBalanceSheet, readProfitAndLoss, readTrialBalance } from '$lib/server/books/booksReports';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import { booksRefusalOpenings } from './booksAnswer';
import { describeTrialBalance } from './describeTrialBalance';
import { describeBalanceSheet } from './describeBalanceSheet';
import { describeProfitAndLoss } from './describeProfitAndLoss';
import type { BoardRecordAsked, TakenReading } from '$lib/data/boardroomRecordPaper';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

async function readingOrRefusal(work: () => Promise<string>): Promise<TakenReading> {
	try {
		return { reading: await work() };
	} catch (failure) {
		if (failure instanceof BooksRefusal) return `${booksRefusalOpenings.reading} ${failure.message}`;
		throw failure;
	}
}

export function takeTrialBalance(supabase: SupabaseClient, organisation: Organisation, asked: BoardRecordAsked): Promise<TakenReading> {
	return readingOrRefusal(async () => {
		const trialBalance = await readTrialBalance(supabase, organisation.id, asked.periodEnd);
		return describeTrialBalance(organisation.name, trialBalance);
	});
}

export function takeBalanceSheet(supabase: SupabaseClient, organisation: Organisation, asked: BoardRecordAsked): Promise<TakenReading> {
	return readingOrRefusal(async () => {
		const sheet = await readBalanceSheet(supabase, organisation.id, asked.periodEnd);
		return describeBalanceSheet(organisation.name, sheet);
	});
}

export function takeProfitAndLoss(supabase: SupabaseClient, organisation: Organisation, asked: BoardRecordAsked): Promise<TakenReading> {
	return readingOrRefusal(async () => {
		const { periodStart, periodEnd, costCentreId } = asked;
		const report = await readProfitAndLoss(supabase, organisation.id, { periodStart, periodEnd, costCentreId });
		const heading = { organisationName: organisation.name, periodStart: periodStart ?? '', periodEnd: periodEnd ?? '', costCentreId };
		return describeProfitAndLoss(heading, report);
	});
}
