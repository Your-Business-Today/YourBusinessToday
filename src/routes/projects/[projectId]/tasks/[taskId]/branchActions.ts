import { fail } from '@sveltejs/kit';
import { taskBranchRefusal } from '$lib/data/branchName';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setTaskBranch } from '$lib/server/projects/setTaskBranch';
import type { Actions } from './$types';

export const branchActions = {
	setBranch: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const branchName = String((await request.formData()).get('branchName') ?? '').trim();
		const refusal = taskBranchRefusal(branchName, project.defaultBranch);
		if (refusal !== null) return fail(400, { message: refusal });
		await setTaskBranch(locals.supabase, params.taskId, { branchName });
		return { message: branchName === '' ? 'Branch cleared.' : `Branch set to ${branchName}.` };
	}
} satisfies Actions;
