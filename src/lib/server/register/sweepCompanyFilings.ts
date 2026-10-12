import type { SupabaseClient } from '@supabase/supabase-js';
import { areaEventKinds } from '$lib/data/areaEventKind';
import { areIndicatorsEqual, indicatorSentence } from '$lib/data/companyIndicators';
import { daysAgo } from '$lib/data/days';
import { filingKinds } from '$lib/data/filingKinds';
import { firstSweepEventDays } from '$lib/data/filingRules';
import { getCompanyProfile } from '$lib/server/companiesHouse/getCompanyProfile';
import { getFilingHistory } from '$lib/server/companiesHouse/getFilingHistory';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import { recordCompanyChecked, storeFilings } from './filingsWriter';
import type { ClassifiedFiling } from '$lib/server/companiesHouse/filingHistoryRecord';
import type { CompanyToCheck } from './companyToCheckRecord';

const noFlags = 'no flags';

/** One company: its filings stored, the new ones told to the feed, its standing compared with what was stored. */
export async function sweepCompanyFilings(supabase: SupabaseClient, company: CompanyToCheck): Promise<number> {
	const [profile, filings] = await Promise.all([getCompanyProfile(company.companyNumber), getFilingHistory(company.companyNumber)]);
	const refusal = await storeFilings(supabase, company.companyNumber, filings);
	if (refusal !== null) throw new Error(refusal);
	const fresh = newFilingsOf(company, filings);
	for (const filing of fresh) await tellFiling(supabase, company, filing);
	const isStandingChanged = company.filingsCheckedAt !== null && !areIndicatorsEqual(company.indicators, profile.indicators);
	const standing = indicatorSentence(profile.indicators) || noFlags;
	if (isStandingChanged) await tellStanding(supabase, company, standing);
	await recordCompanyChecked(supabase, company.companyNumber, profile.indicators, filings[0]?.transactionId ?? company.lastFilingTransactionId);
	return fresh.length;
}

/** Newer than the last seen, or within the first sweep's window when nothing was seen before. */
function newFilingsOf(company: CompanyToCheck, filings: ClassifiedFiling[]): ClassifiedFiling[] {
	if (company.lastFilingTransactionId === '') {
		const since = daysAgo(firstSweepEventDays);
		return filings.filter((filing) => filing.filedOn >= since);
	}
	const lastSeenAt = filings.findIndex((filing) => filing.transactionId === company.lastFilingTransactionId);
	return lastSeenAt < 0 ? filings : filings.slice(0, lastSeenAt);
}

function tellFiling(supabase: SupabaseClient, company: CompanyToCheck, filing: ClassifiedFiling): Promise<void> {
	const isAccounts = filing.kind === filingKinds.accounts && filing.madeUpTo !== '';
	return recordAreaEvent(supabase, {
		sector: company.sector,
		patchId: null,
		kind: filing.feedKind,
		actorAccountId: null,
		companyNumber: company.companyNumber,
		detail: `${company.name}: ${filing.sentence}`,
		sourceUrl: `${company.sourceUrl}/filing-history`,
		sourceKey: isAccounts ? `accounts_filed:${company.companyNumber}:${filing.madeUpTo}` : `filing:${filing.transactionId}`,
		happenedAt: filing.filedOn === '' ? null : filing.filedOn
	});
}

function tellStanding(supabase: SupabaseClient, company: CompanyToCheck, sentence: string): Promise<void> {
	return recordAreaEvent(supabase, {
		sector: company.sector,
		patchId: null,
		kind: areaEventKinds.indicatorChanged,
		actorAccountId: null,
		companyNumber: company.companyNumber,
		detail: `${company.name}: ${sentence}`,
		sourceUrl: company.sourceUrl,
		sourceKey: `indicator_changed:${company.companyNumber}:${daysAgo(0)}`
	});
}
