import { fail, type RequestEvent } from '@sveltejs/kit';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { approveGoalPlan } from './approveGoalPlan';

const staffOnly = 'Only YBT staff answer a request that changes the design.';
const nothingAwaiting = 'Nothing under that goal is awaiting YBT approval.';

/** YBT staff accept a goal's plan from the Requested tab, so the goal and every task under it move to the board together. */
export async function approveGoalRequestsAction({ locals, params, request }: RequestEvent<{ projectId: string }>) {
	const { user } = await requireProjectAccess(locals, params.projectId);
	const isStaff = await isStaffMember(locals);
	if (!isStaff) return fail(403, { message: staffOnly });
	const formData = await request.formData();
	const goalId = String(formData.get('goalId') ?? '');
	const plan = { projectId: params.projectId, goalId: goalId === '' ? null : goalId, answeredBy: user.id };
	const approved = await approveGoalPlan(locals.supabase, plan);
	if (approved.length === 0) return fail(409, { message: nothingAwaiting });
	return {};
}
