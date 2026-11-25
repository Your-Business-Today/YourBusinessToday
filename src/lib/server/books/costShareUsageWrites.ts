import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { monthOfDay, monthStart, validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import type { CostShareSplitByChoice } from '$lib/data/books/sharing/costShareUsage';
import { CostShareUsageLimits, splitByRefusal, usageRefusal } from '$lib/data/books/sharing/costShareUsageRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findLatestClose } from './booksClosing';
import { CostShareTables } from './costShares';
import { costShareUsageTable } from './costShareUsageReadings';
import { findCostShare } from './costShareWrites';

/** One project's usage of a shared cost in a month, such as its dollars of Vercel usage on the bill. */
export type UsageReading = { projectId: string; usage: number };

/** Sets how a shared cost's months are split: by usage readings, or by the members' weights, equal where none is set. */
export async function setCostShareSplitBy(supabase: SupabaseClient, organisationId: string, costCentreId: unknown, splitBy: unknown): Promise<void> {
	refuseWhen(splitByRefusal(splitBy));
	const share = await findCostShare(supabase, organisationId, costCentreId);
	const columns = { split_by: splitBy as CostShareSplitByChoice, updated_at: new Date().toISOString() };
	const { error } = await supabase.from(CostShareTables.shares).update(columns).eq('organisation_id', organisationId).eq('id', share.id);
	if (error !== null) throw error;
}

/** Keeps a month's usage readings of a shared cost in place of any kept before for that month; refused for a month the books have closed. */
export async function recordCostShareUsage(
	supabase: SupabaseClient,
	organisationId: string,
	request: { costCentreId: unknown; month: unknown; readings: unknown }
): Promise<UsageReading[]> {
	refuseWhen(validateMonthKey('month', request.month));
	const readings = validatedReadings(request.readings);
	const month = request.month as MonthKey;
	const share = await findCostShare(supabase, organisationId, request.costCentreId);
	const latest = await findLatestClose(supabase, organisationId);
	const isClosed = latest !== null && month <= monthOfDay(latest.closed_to_month);
	if (isClosed) throw new BooksRefusal(`The books are closed to ${monthOfDay(latest.closed_to_month)}, so ${month} keeps the split it closed with.`);
	await refuseProjectsNotOwned(supabase, organisationId, readings);
	const kept = { organisation_id: organisationId, cost_share_id: share.id, month: monthStart(month) };
	const cleared = await supabase.from(costShareUsageTable).delete().eq('organisation_id', organisationId).eq('cost_share_id', share.id).eq('month', kept.month);
	if (cleared.error !== null) throw cleared.error;
	if (readings.length === 0) return readings;
	const rows = readings.map((reading) => ({ ...kept, project_id: reading.projectId, usage: reading.usage }));
	const { error } = await supabase.from(costShareUsageTable).insert(rows);
	if (error !== null) throw error;
	return readings;
}

function validatedReadings(candidate: unknown): UsageReading[] {
	const { mostReadings } = CostShareUsageLimits;
	if (!Array.isArray(candidate)) throw new BooksRefusal('readings is a list of { projectId, usage }, one for each project that used the cost that month.');
	if (candidate.length > mostReadings) throw new BooksRefusal(`readings holds at most ${mostReadings} projects; ${candidate.length} were given.`);
	const readings = candidate.map((reading) => readingOf(reading));
	const projectIds = new Set(readings.map((reading) => reading.projectId));
	if (projectIds.size < readings.length) throw new BooksRefusal('readings names a project more than once; give each project one reading for the month.');
	return readings;
}

function readingOf(candidate: unknown): UsageReading {
	const { projectId, usage } = (candidate ?? {}) as { projectId?: unknown; usage?: unknown };
	refuseWhen(validateRecordId('project', String(projectId ?? '')));
	refuseWhen(usageRefusal(usage));
	return { projectId: projectId as string, usage: usage as number };
}

async function refuseProjectsNotOwned(supabase: SupabaseClient, organisationId: string, readings: UsageReading[]): Promise<void> {
	if (readings.length === 0) return;
	const projectIds = readings.map((reading) => reading.projectId);
	const { data, error } = await supabase.from('projects').select('id').eq('organisation_id', organisationId).in('id', projectIds);
	if (error !== null) throw error;
	const owned = new Set((data as { id: string }[]).map((project) => project.id));
	const strangers = projectIds.filter((projectId) => !owned.has(projectId));
	if (strangers.length > 0) throw new BooksRefusal(`Not one of this organisation's own projects: ${strangers.join(', ')}; list_projects gives each project's id.`);
}
