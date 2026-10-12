import type { SupabaseClient } from '@supabase/supabase-js';
import { areaEventKinds } from '$lib/data/areaEventKind';
import { describeFiledFigures } from '$lib/data/filedFigures';
import { filingHistoryUrl, type AccountsBulkFile } from './accountsBulkFile';
import { formatBritishDate } from '$lib/data/britishDate';
import { readFiledFigures } from './readFiledFigures';
import { readZipEntry } from '$lib/server/zip/readZipEntry';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import { recordFiledFigures } from '$lib/server/register/recordFiledFigures';
import type { AccountsFiling } from './accountsFileName';
import type { MatchedRegisterCompany } from '$lib/server/register/matchRegisterCompanies';

const fromTheDailyFile = '(from the daily accounts file)';
const decoder = new TextDecoder();

/** The filing goes in the feed; then the accounts document is read and its figures put on the register row and in the feed too. */
export async function recordAccountsFiling(supabase: SupabaseClient, file: AccountsBulkFile, filing: AccountsFiling, company: MatchedRegisterCompany): Promise<void> {
	const sourceUrl = filingHistoryUrl(company.companyNumber);
	await recordAreaEvent(supabase, {
		sector: company.sector,
		patchId: null,
		kind: areaEventKinds.accountsFiled,
		actorAccountId: null,
		companyNumber: company.companyNumber,
		detail: `${company.name} filed accounts made up to ${formatBritishDate(filing.madeUpTo)} ${fromTheDailyFile}`,
		sourceUrl,
		sourceKey: `accounts_filed:${company.companyNumber}:${filing.madeUpTo}`
	});
	await readAndRecordFigures(supabase, file, filing, company, sourceUrl);
}

async function readAndRecordFigures(supabase: SupabaseClient, file: AccountsBulkFile, filing: AccountsFiling, company: MatchedRegisterCompany, sourceUrl: string): Promise<void> {
	const entry = file.entriesByName.get(filing.memberName);
	if (entry === undefined) return;
	const document = decoder.decode(await readZipEntry(file.source, entry));
	const figures = readFiledFigures(document, filing.madeUpTo, sourceUrl);
	const refusal = await recordFiledFigures(supabase, company.companyNumber, figures);
	if (refusal !== null) return;
	await recordAreaEvent(supabase, {
		sector: company.sector,
		patchId: null,
		kind: areaEventKinds.figuresRead,
		actorAccountId: null,
		companyNumber: company.companyNumber,
		detail: `${company.name}: ${describeFiledFigures(figures)}`,
		sourceUrl,
		sourceKey: `figures_read:${filing.memberName}`
	});
}
