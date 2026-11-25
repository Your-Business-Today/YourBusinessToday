import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { describeMonth, shiftMonth, validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import { isSharingIn, type CostShareMember } from '$lib/data/books/sharing/costShare';
import { weightRefusal } from '$lib/data/books/sharing/costShareWeights';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { CostShareTables, costShareMemberColumns, fromCostShareMemberRow, type CostShareMemberRow } from './costShares';
import { findMemberRow } from './costShareMembers';
import { monthColumn } from './costShareWrites';

const monthBefore = -1;

/**
 * Gives a member a new weight from a month it shares the cost: changed in place from the month it joined, or else its
 * spell ends the month before and a new spell carries the new weight on, so the months before stay as they were.
 */
export async function setCostShareMemberWeight(
	supabase: SupabaseClient,
	organisationId: string,
	request: { memberId: unknown; fromMonth: unknown; weight: unknown }
): Promise<CostShareMember[]> {
	refuseWhen(validateRecordId('cost share member', String(request.memberId ?? '')));
	refuseWhen(validateMonthKey('fromMonth', request.fromMonth));
	refuseWhen(weightRefusal(request.weight));
	const row = await findMemberRow(supabase, organisationId, request.memberId as string);
	const member = fromCostShareMemberRow(row);
	const fromMonth = request.fromMonth as MonthKey;
	if (!isSharingIn(member, fromMonth)) throw new BooksRefusal(`fromMonth must be a month the member shares the cost, from ${describeMonth(member.joinedMonth)}.`);
	const weight = request.weight as number;
	const writes = { supabase, organisationId };
	if (fromMonth === member.joinedMonth) return [await updateMember(writes, row.id, { weight })];
	const ended = await updateMember(writes, row.id, { left_month: monthColumn(shiftMonth(fromMonth, monthBefore)) });
	const carriedOn = await insertSpell(writes, row, fromMonth, weight).catch(async (failure) => {
		await updateMember(writes, row.id, { left_month: row.left_month });
		throw failure;
	});
	return [ended, carriedOn];
}

type Writes = { supabase: SupabaseClient; organisationId: string };

async function updateMember(writes: Writes, memberId: string, columns: Record<string, unknown>): Promise<CostShareMember> {
	const { data, error } = await writes.supabase
		.from(CostShareTables.members)
		.update({ ...columns, updated_at: new Date().toISOString() })
		.eq('organisation_id', writes.organisationId)
		.eq('id', memberId)
		.select(costShareMemberColumns)
		.single();
	if (error !== null) throw error;
	return fromCostShareMemberRow(data as CostShareMemberRow);
}

async function insertSpell(writes: Writes, row: CostShareMemberRow, fromMonth: MonthKey, weight: number): Promise<CostShareMember> {
	const spell = {
		organisation_id: writes.organisationId,
		cost_share_id: row.cost_share_id,
		project_id: row.project_id,
		joined_month: monthColumn(fromMonth),
		left_month: row.left_month,
		weight
	};
	const { data, error } = await writes.supabase.from(CostShareTables.members).insert(spell).select(costShareMemberColumns).single();
	if (error !== null) throw error;
	return fromCostShareMemberRow(data as CostShareMemberRow);
}
