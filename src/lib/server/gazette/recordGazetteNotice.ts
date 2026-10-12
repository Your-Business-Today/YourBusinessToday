import type { SupabaseClient } from '@supabase/supabase-js';
import { formatBritishDate } from '$lib/data/britishDate';
import { gazetteNoticeDetails, gazetteNoticeStatusNotes } from '$lib/data/gazetteNotices';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import { recordStatusNote } from '$lib/server/register/recordStatusNote';
import type { GazetteNotice } from './gazetteNoticeRecord';
import type { MatchedRegisterCompany } from '$lib/server/register/matchRegisterCompanies';

/** The notice goes in the feed the day it was published, and the company's register row says what it is in. */
export async function recordGazetteNotice(supabase: SupabaseClient, notice: GazetteNotice, company: MatchedRegisterCompany): Promise<void> {
	await recordAreaEvent(supabase, {
		sector: company.sector,
		patchId: null,
		kind: notice.kind,
		actorAccountId: null,
		companyNumber: company.companyNumber,
		detail: gazetteNoticeDetails[notice.kind](company.name),
		sourceUrl: notice.noticeUrl,
		sourceKey: `gazette:${notice.noticeId}`
	});
	await recordStatusNote(supabase, company.companyNumber, `${gazetteNoticeStatusNotes[notice.kind]}, noticed ${formatBritishDate(notice.publishedOn)}`);
}
