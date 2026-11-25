import type { SupabaseClient } from '@supabase/supabase-js';
import { askKinds } from '$lib/data/askKind';
import { awaitingKinds, postedViaChannels, type HandOff } from '$lib/data/conversationTurn';
import { designReviewStageName } from '$lib/data/designReview';
import { postMessage } from '$lib/server/conversations/postMessage';
import type { Project } from '$lib/server/projects/projectRecord';

export type DesignRequest = { taskId: string; raisedBy: string; change: string };

/**
 * Posts on the task that it changes the design and waits for YBT, waiting on the project's owner
 * when they are YBT staff and did not raise it themselves: their Claude brings it to them.
 */
export async function askForDesignApproval(
	supabase: SupabaseClient,
	project: Project,
	request: DesignRequest
): Promise<void> {
	const approver = await approverFor(supabase, project, request.raisedBy);
	const body =
		`${designReviewStageName}. This request changes the system's design, so nothing builds it ` +
		`until YBT approves it.\n\nWhat it changes: ${request.change}\n\n` +
		'YBT answers with approve_design_change or reject_design_change, giving the reason.';
	const origin = { postedVia: postedViaChannels.claude, awaiting: approver, askKind: askKinds.information };
	await postMessage(supabase, { taskId: request.taskId }, request.raisedBy, body, origin);
}

async function approverFor(supabase: SupabaseClient, project: Project, raisedBy: string): Promise<HandOff | null> {
	if (project.ownerId === raisedBy) return null;
	const { data, error } = await supabase
		.from('profiles')
		.select('is_staff, is_admin')
		.eq('id', project.ownerId)
		.maybeSingle();
	if (error) throw error;
	const isStaffOwner = data?.is_staff === true || data?.is_admin === true;
	if (!isStaffOwner) return null;
	return { accountId: project.ownerId, kind: awaitingKinds.person };
}
