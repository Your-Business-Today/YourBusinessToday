import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { MonthKey } from '$lib/data/books/monthKey';
import type { CostShareMember } from '$lib/data/books/sharing/costShare';
import { CostShareMembersBy } from '$lib/data/books/sharing/costShareMembersBy';
import { equalWeight, weightRefusal } from '$lib/data/books/sharing/costShareWeights';
import { leftMonthRefusal, memberMonthsRefusal, spellsOverlap } from '$lib/data/books/sharing/costShareRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { projectOfOrganisation } from './costCentreProjectOwner';
import { CostShareTables, costShareMemberColumns, fromCostShareMemberRow, type CostShareMemberRow } from './costShares';
import { findCostShare, monthColumn } from './costShareWrites';

/** What a project is to share a cost from and to: the cost centre shared, the project, the month it joins and the month it leaves, if any. */
export type CostShareMemberRequest = { costCentreId: unknown; projectId: unknown; joinedMonth: unknown; leftMonth?: unknown; weight?: unknown };

/** Adds one of the organisation's projects to a shared cost from a month, refused when the project already shares it in any of those months. */
export async function addCostShareMember(supabase: SupabaseClient, organisationId: string, request: CostShareMemberRequest): Promise<CostShareMember> {
	const leftMonth = request.leftMonth === undefined || request.leftMonth === '' ? null : request.leftMonth;
	refuseWhen(memberMonthsRefusal(request.joinedMonth, leftMonth));
	const weight = request.weight ?? equalWeight;
	refuseWhen(weightRefusal(weight));
	const spell = { joinedMonth: request.joinedMonth as MonthKey, leftMonth: leftMonth as MonthKey | null };
	const share = await findCostShare(supabase, organisationId, request.costCentreId);
	if (share.members_by === CostShareMembersBy.liveProjects)
		throw new BooksRefusal('This cost is shared by every live project, read from their status; set_cost_share_members_by with named takes named members instead.');
	const project = await projectOfOrganisation(supabase, organisationId, request.projectId);
	if (project === null) throw new BooksRefusal('projectId is needed: the project that shares the cost, by its id as list_projects gives it.');
	const spells = await spellsOfProject(supabase, organisationId, share.id, project.id);
	const isAlreadySharing = spells.some((existing) => spellsOverlap(existing, spell));
	if (isAlreadySharing)
		throw new BooksRefusal(`Project ${project.name} already shares this cost in some of those months; set_cost_share_member_leaving ends a spell.`);
	const row = {
		organisation_id: organisationId,
		cost_share_id: share.id,
		project_id: project.id,
		joined_month: monthColumn(spell.joinedMonth),
		left_month: monthColumn(spell.leftMonth),
		weight
	};
	const { data, error } = await supabase.from(CostShareTables.members).insert(row).select(costShareMemberColumns).single();
	if (error !== null) throw error;
	return fromCostShareMemberRow(data as CostShareMemberRow);
}

/** Sets the last month a member shares its cost, or none to carry on: the months before stay as they were. */
export async function setCostShareMemberLeaving(
	supabase: SupabaseClient,
	organisationId: string,
	memberId: unknown,
	leftMonth: unknown
): Promise<CostShareMember> {
	refuseWhen(validateRecordId('cost share member', String(memberId ?? '')));
	const memberRow = await findMemberRow(supabase, organisationId, memberId as string);
	const member = fromCostShareMemberRow(memberRow);
	const carriesOn = leftMonth === undefined || leftMonth === null || leftMonth === '';
	refuseWhen(carriesOn ? null : leftMonthRefusal(member.joinedMonth, leftMonth));
	const spell = { joinedMonth: member.joinedMonth, leftMonth: carriesOn ? null : (leftMonth as MonthKey) };
	const otherSpells = await otherSpellsOf(supabase, organisationId, memberRow);
	const meetsLaterSpell = otherSpells.some((existing) => spellsOverlap(existing, spell));
	if (meetsLaterSpell) throw new BooksRefusal('The project shares this cost again in a later spell; it cannot carry on into the months of that spell.');
	const { data, error } = await supabase
		.from(CostShareTables.members)
		.update({ left_month: carriesOn ? null : monthColumn(leftMonth as MonthKey), updated_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', memberId)
		.select(costShareMemberColumns)
		.single();
	if (error !== null) throw error;
	return fromCostShareMemberRow(data as CostShareMemberRow);
}

export async function findMemberRow(supabase: SupabaseClient, organisationId: string, memberId: string): Promise<CostShareMemberRow> {
	const { data, error } = await supabase
		.from(CostShareTables.members)
		.select(costShareMemberColumns)
		.eq('organisation_id', organisationId)
		.eq('id', memberId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No cost share member ${memberId} is in this organisation's books; read_cost_shares lists them.`);
	return data as CostShareMemberRow;
}

async function otherSpellsOf(supabase: SupabaseClient, organisationId: string, memberRow: CostShareMemberRow): Promise<CostShareMember[]> {
	if (memberRow.project_id === null) return [];
	const spells = await spellsOfProject(supabase, organisationId, memberRow.cost_share_id, memberRow.project_id);
	return spells.filter((spell) => spell.id !== memberRow.id);
}

async function spellsOfProject(supabase: SupabaseClient, organisationId: string, costShareId: string, projectId: string): Promise<CostShareMember[]> {
	const { data, error } = await supabase
		.from(CostShareTables.members)
		.select(costShareMemberColumns)
		.eq('organisation_id', organisationId)
		.eq('cost_share_id', costShareId)
		.eq('project_id', projectId);
	if (error !== null) throw error;
	return (data as CostShareMemberRow[]).map(fromCostShareMemberRow);
}
