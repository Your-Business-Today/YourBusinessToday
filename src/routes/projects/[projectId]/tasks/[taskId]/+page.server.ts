import { error, fail, redirect } from '@sveltejs/kit';
import { addAcceptanceCriterion } from '$lib/server/projects/addAcceptanceCriterion';
import { accountNameLookup } from '$lib/data/accountNames';
import { attachmentActions } from './attachmentActions';
import { branchActions } from './branchActions';
import { checklistActions } from './checklistActions';
import { saveTaskActions } from './saveTaskActions';
import { conversationActions } from './conversationActions';
import { createTask, readNewTaskSeed } from '$lib/server/projects/createTask';
import { newTaskStoryRefusal } from '$lib/server/projects/newTaskStoryRefusal';
import { deleteAcceptanceCriterion } from '$lib/server/projects/deleteAcceptanceCriterion';
import { deleteTask } from '$lib/server/projects/deleteTask';
import { getTask } from '$lib/server/projects/getTask';
import { getTaskFamily } from '$lib/server/projects/getTaskFamily';
import { getOtherProjects } from '$lib/server/projects/getOtherProjects';
import { loadTaskWorkspace } from '$lib/server/projects/loadTaskWorkspace';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setCriterionMet } from '$lib/server/projects/setCriterionMet';
import { withAuthorNames } from '$lib/server/conversations/withAuthorNames';
import { withUploaderNames } from '$lib/server/projects/uploaderNames';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await requireProjectAccess(locals, params.projectId);
	const workspace = await loadTaskWorkspace(locals.supabase, params.projectId, params.taskId);
	if (workspace === null) error(404, 'Task not found');
	const task = workspace.task;
	return {
		...workspace,
		otherProjects: await getOtherProjects(locals.supabase, params.projectId),
		...(await getTaskFamily(locals.supabase, task)),
		messages: withAuthorNames(workspace.messages, workspace.accounts),
		raisedByName: accountNameLookup(workspace.accounts)(task.createdBy),
		attachments: withUploaderNames(workspace.attachments, workspace.people),
		viewerId: user.id
	};
};

export const actions: Actions = {
	...saveTaskActions,
	...checklistActions,
	...attachmentActions,
	...branchActions,
	...conversationActions,
	addSubtask: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const seed = readNewTaskSeed(await request.formData());
		if (seed === null) return fail(400, { message: 'A subtask title is required.' });
		const storyRefusal = newTaskStoryRefusal(seed);
		if (storyRefusal !== null) return fail(400, { message: storyRefusal });
		await createTask(locals.supabase, params.projectId, seed, user.id);
		return {};
	},
	addCriterion: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const description = String(formData.get('description') ?? '').trim();
		if (description === '') return fail(400, { message: 'A criterion needs a description.' });
		await addAcceptanceCriterion(locals.supabase, params.taskId, description);
		return {};
	},
	setCriterionMet: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const criterionId = String(formData.get('criterionId') ?? '');
		if (criterionId === '') return fail(400, { message: 'A criterion is required.' });
		await setCriterionMet(locals.supabase, criterionId, formData.get('isMet') === 'true');
		return {};
	},
	deleteCriterion: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const criterionId = String(formData.get('criterionId') ?? '');
		if (criterionId === '') return fail(400, { message: 'A criterion is required.' });
		await deleteAcceptanceCriterion(locals.supabase, criterionId);
		return {};
	},
	deleteTask: async ({ locals, params }) => {
		await requireProjectAccess(locals, params.projectId);
		await deleteTask(locals.supabase, params.taskId);
		redirect(303, `/projects/${params.projectId}`);
	}
};
