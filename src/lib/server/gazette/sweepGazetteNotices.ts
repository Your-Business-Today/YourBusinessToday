import type { SupabaseClient } from '@supabase/supabase-js';
import { daysToSweep } from '$lib/server/companiesHouse/accounts/daysToSweep';
import { listInsolvencyNotices } from './listInsolvencyNotices';
import { matchRegisterCompanies } from '$lib/server/register/matchRegisterCompanies';
import { readNoticeCompanyNumber } from './readNoticeCompanyNumber';
import { recordGazetteNotice } from './recordGazetteNotice';
import type { GazetteNotice } from './gazetteNoticeRecord';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 200_000;
const mostNoticesOpened = 8;
const millisecondsPerDay = 86_400_000;

/** Each day's corporate insolvency notices since the last day read, matched to register companies by number. */
export async function sweepGazetteNotices(supabase: SupabaseClient, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	const tomorrow = new Date(Date.now() + millisecondsPerDay);
	const stopAt = Date.now() + timeBudgetMilliseconds;
	let marker = start.resumeMarker;
	let rowsWritten = 0;
	const notes: string[] = [];
	for (const day of daysToSweep(start.resumeMarker, tomorrow)) {
		const isOutOfTime = Date.now() > stopAt;
		if (isOutOfTime) return { rowsWritten, resumeMarker: marker, note: `Out of time after ${marker}.`, isFinished: false };
		rowsWritten += await sweepDay(supabase, day, notes);
		marker = day;
		await progress(marker, rowsWritten);
	}
	return { rowsWritten, resumeMarker: marker, note: notes.join(' ') || 'Nothing new to read.', isFinished: true };
}

async function sweepDay(supabase: SupabaseClient, day: string, notes: string[]): Promise<number> {
	const notices = await withCompanyNumbers(await listInsolvencyNotices(day));
	const numbered = notices.filter((notice) => notice.companyNumber !== '');
	const companies = await matchRegisterCompanies(supabase, numbered.map((notice) => notice.companyNumber));
	const inPatches = numbered.filter((notice) => companies.has(notice.companyNumber));
	for (const notice of inPatches) {
		const company = companies.get(notice.companyNumber);
		if (company !== undefined) await recordGazetteNotice(supabase, notice, company);
	}
	const unnumbered = notices.length - numbered.length;
	notes.push(`${day}: ${inPatches.length} of ${notices.length} notices named register companies${unnumbered === 0 ? '' : `, ${unnumbered} carried no number`}.`);
	return inPatches.length;
}

/** A notice whose text names no company number is asked for its own data, a few per run, so the pacing holds. */
async function withCompanyNumbers(notices: GazetteNotice[]): Promise<GazetteNotice[]> {
	let opened = 0;
	const numbered: GazetteNotice[] = [];
	for (const notice of notices) {
		const needsOpening = notice.companyNumber === '' && opened < mostNoticesOpened;
		if (!needsOpening) {
			numbered.push(notice);
			continue;
		}
		opened += 1;
		numbered.push({ ...notice, companyNumber: await readNoticeCompanyNumber(notice.noticeId) });
	}
	return numbered;
}
