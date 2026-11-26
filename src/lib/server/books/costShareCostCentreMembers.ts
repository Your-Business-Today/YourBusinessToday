import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { MonthKey } from '$lib/data/books/monthKey';
import type { CostShareMember } from '$lib/data/books/sharing/costShare';
import { memberMonthsRefusal, spellsOverlap } from '$lib/data/books/sharing/costShareRules';
import { equalWeight, weightRefusal } from '$lib/data/books/sharing/costShareWeights';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { CostShareTables, costShareMemberColumns, fromCostShareMemberRow, type CostShareMemberRow } from './costShares';
import { findCostShare, monthColumn } from './costShareWrites';
import { findDirectorsLoanAccountId } from './costShareLoanAccount';

const foreignKeyViolation = '23503';

/** What a cost centre with no project is to share a cost from and to: the cost shared, the cost centre sharing it, its months and weight. */
export type CostCentreMemberRequest = {
	costCentreId: unknown;
	memberCostCentreId: unknown;
	joinedMonth: unknown;
	leftMonth?: unknown;
	weight?: unknown;
	directorsLoanAccountId?: unknown;
};

/**
 * Adds a cost centre that has no project, such as one for a group of companies, to a shared cost from a month, beside
 * its projects; refused when it already shares the cost in any of those months, and never the shared cost's own. Naming a
 * director's loan account keeps the part on that loan, moved there month by month by post_cost_share_directors_loan.
 */
export async function addCostCentreMember(supabase: SupabaseClient, organisationId: string, request: CostCentreMemberRequest): Promise<CostShareMember> {
	const leftMonth = request.leftMonth === undefined || request.leftMonth === '' ? null : request.leftMonth;
	refuseWhen(memberMonthsRefusal(request.joinedMonth, leftMonth));
	const weight = request.weight ?? equalWeight;
	refuseWhen(weightRefusal(weight));
	refuseWhen(validateRecordId('member cost centre', String(request.memberCostCentreId ?? '')));
	const memberCostCentreId = request.memberCostCentreId as string;
	const directorsLoanAccountId = await findDirectorsLoanAccountId(supabase, organisationId, request.directorsLoanAccountId);
	if (memberCostCentreId === request.costCentreId)
		throw new BooksRefusal('A shared cost cannot be shared with its own cost centre; name the cost centre that takes a part.');
	const share = await findCostShare(supabase, organisationId, request.costCentreId);
	const spell = { joinedMonth: request.joinedMonth as MonthKey, leftMonth: leftMonth as MonthKey | null };
	const spells = await spellsOfCostCentre(supabase, organisationId, share.id, memberCostCentreId);
	const isAlreadySharing = spells.some((existing) => spellsOverlap(existing, spell));
	if (isAlreadySharing)
		throw new BooksRefusal('That cost centre already shares this cost in some of those months; set_cost_share_member_leaving ends a spell.');
	const kept = { cost_centre_id: memberCostCentreId, directors_loan_account_id: directorsLoanAccountId };
	const row = { organisation_id: organisationId, cost_share_id: share.id, ...kept, weight };
	const months = { joined_month: monthColumn(spell.joinedMonth), left_month: monthColumn(spell.leftMonth) };
	const { data, error } = await supabase
		.from(CostShareTables.members)
		.insert({ ...row, ...months })
		.select(costShareMemberColumns)
		.single();
	if (error?.code === foreignKeyViolation)
		throw new BooksRefusal(`No cost centre ${memberCostCentreId} is in this organisation's books; list_cost_centres lists them.`);
	if (error !== null) throw error;
	return fromCostShareMemberRow(data as CostShareMemberRow);
}

async function spellsOfCostCentre(supabase: SupabaseClient, organisationId: string, costShareId: string, costCentreId: string): Promise<CostShareMember[]> {
	const { data, error } = await supabase
		.from(CostShareTables.members)
		.select(costShareMemberColumns)
		.eq('organisation_id', organisationId)
		.eq('cost_share_id', costShareId)
		.eq('cost_centre_id', costCentreId);
	if (error !== null) throw error;
	return (data as CostShareMemberRow[]).map(fromCostShareMemberRow);
}
