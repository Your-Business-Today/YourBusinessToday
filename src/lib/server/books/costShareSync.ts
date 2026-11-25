import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import { planMemberSync, type MemberSyncPlan } from '$lib/data/books/sharing/memberSync';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { projectOfOrganisation, type OwnedProject } from './costCentreProjectOwner';
import { CostShareTables, costShareMemberColumns, fromCostShareMemberRow, type CostShareMemberRow } from './costShares';
import { findCostShare, monthColumn } from './costShareWrites';

/** The shared cost, the month, and every project using the cost in that month. */
export type MemberSyncRequest = { costCentreId: unknown; month: unknown; projectIds: unknown };

/** What the sync changed, and the names of the projects it names. */
export type MemberSyncResult = { month: MonthKey; plan: MemberSyncPlan; projectNames: Map<string, string> };

export const MemberSyncLimits = { mostProjects: 200 } as const;

/** Makes exactly the projects given share the cost from the month on, leaving every month before as it was. */
export async function syncCostShareMembers(supabase: SupabaseClient, organisationId: string, request: MemberSyncRequest): Promise<MemberSyncResult> {
	refuseWhen(validateMonthKey('month', request.month));
	const projectIds = validatedProjectIds(request.projectIds);
	const share = await findCostShare(supabase, organisationId, request.costCentreId);
	const projects = await Promise.all(projectIds.map((projectId) => projectOfOrganisation(supabase, organisationId, projectId)));
	const month = request.month as MonthKey;
	const plan = planMemberSync(await membersOf(supabase, organisationId, share.id), month, projectIds);
	await applyPlan(supabase, organisationId, share.id, month, plan);
	const projectNames = new Map((projects as OwnedProject[]).map((project) => [project.id, project.name]));
	return { month, plan, projectNames };
}

function validatedProjectIds(candidate: unknown): string[] {
	if (!Array.isArray(candidate))
		throw new BooksRefusal('projectIds is a list of the projects using the cost that month, each by its id as list_projects gives it.');
	if (candidate.length > MemberSyncLimits.mostProjects)
		throw new BooksRefusal(`projectIds holds at most ${MemberSyncLimits.mostProjects} projects; ${candidate.length} were given.`);
	candidate.forEach((projectId) => refuseWhen(validateRecordId('project', String(projectId))));
	return [...new Set(candidate as string[])];
}

async function membersOf(supabase: SupabaseClient, organisationId: string, costShareId: string) {
	const { data, error } = await supabase
		.from(CostShareTables.members)
		.select(costShareMemberColumns)
		.eq('organisation_id', organisationId)
		.eq('cost_share_id', costShareId);
	if (error !== null) throw error;
	return (data as CostShareMemberRow[]).map(fromCostShareMemberRow);
}

async function applyPlan(supabase: SupabaseClient, organisationId: string, costShareId: string, month: MonthKey, plan: MemberSyncPlan): Promise<void> {
	const memberRows = () => supabase.from(CostShareTables.members);
	const updatedAt = new Date().toISOString();
	const leaving = plan.leaving.map(({ memberId, leftMonth }) =>
		memberRows()
			.update({ left_month: monthColumn(leftMonth), updated_at: updatedAt })
			.eq('organisation_id', organisationId)
			.eq('id', memberId)
	);
	const removed = plan.removed.map(({ memberId }) => memberRows().delete().eq('organisation_id', organisationId).eq('id', memberId));
	const joining = plan.joining.map((projectId) =>
		memberRows().insert({ organisation_id: organisationId, cost_share_id: costShareId, project_id: projectId, joined_month: monthColumn(month) })
	);
	const results = await Promise.all([...leaving, ...removed, ...joining]);
	const failure = results.find((result) => result.error !== null);
	if (failure !== undefined) throw failure.error;
}
