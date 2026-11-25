import { fail, type RequestEvent } from '@sveltejs/kit';
import { isAwaitingDesignApproval } from '$lib/data/designReview';
import { readDesignAnswerFromForm } from '$lib/data/designAnswerForm';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { answerDesignReview } from './answerDesignReview';

const staffOnly = 'Only YBT staff answer a request that changes the design.';
const notAwaiting = 'That request is no longer awaiting YBT approval.';

/** YBT staff approve a request on the Requested tab, or turn it down with the reason. */
export async function answerDesignRequestAction({ locals, params, request }: RequestEvent<{ projectId: string }>) {
	const { user } = await requireProjectAccess(locals, params.projectId);
	const isStaff = await isStaffMember(locals);
	if (!isStaff) return fail(403, { message: staffOnly });
	const formData = await request.formData();
	const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
	if (task === null) return fail(400, { message: taskOnProjectRequired });
	if (!isAwaitingDesignApproval(task)) return fail(409, { message: notAwaiting });
	const answer = readDesignAnswerFromForm(formData);
	if ('refusal' in answer) return fail(400, { message: answer.refusal, taskId: task.id });
	await answerDesignReview(locals.supabase, { taskId: task.id, ...answer, answeredBy: user.id });
	return {};
}
