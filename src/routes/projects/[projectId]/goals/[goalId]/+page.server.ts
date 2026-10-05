import { error, fail, redirect } from '@sveltejs/kit';
import { deleteGoal } from '$lib/server/goals/deleteGoal';
import { findTasks } from '$lib/server/support/findTasks';
import { getGoal } from '$lib/server/goals/getGoal';
import { getProject } from '$lib/server/projects/getProject';
import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { loadConversation } from '$lib/server/conversations/loadConversation';
import { postMessageFromForm } from '$lib/server/conversations/postMessageFromForm';
import { parseRank } from '$lib/server/ordering/rankInput';
import {
	addParticipantFromForm,
	removeParticipantFromForm
} from '$lib/server/conversations/participantFormActions';
import { readGoalUpdate, updateGoal } from '$lib/server/goals/updateGoal';
import { setGoalPriority } from '$lib/server/goals/setGoalPriority';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await requireProjectAccess(locals, params.projectId);
	const [goal, project] = await Promise.all([
		getGoal(locals.supabase, params.goalId),
		getProject(locals.supabase, params.projectId)
	]);
	if (goal === null || project === null || goal.projectId !== project.id)
		error(404, 'Goal not found');
	const subject = { goalId: goal.id };
	const [tasks, people, conversation] = await Promise.all([
		findTasks(locals.supabase, { projectId: project.id, goalId: goal.id, phrase: '' }),
		getProjectPeople(locals.supabase, project.id),
		loadConversation(locals.supabase, subject, user.id)
	]);
	return { goal, project, tasks, people, ...conversation };
};

export const actions: Actions = {
	saveGoal: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const update = readGoalUpdate(formData);
		if (update === null) return fail(400, { message: 'A goal needs a title.' });
		await updateGoal(locals.supabase, params.goalId, update);
		const priority = parseRank(formData.get('priority'));
		if (priority !== null) await setGoalPriority(locals.supabase, params.goalId, priority);
		return { message: 'Goal saved.' };
	},
	postMessage: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const subject = { goalId: params.goalId };
		const formData = await request.formData();
		return postMessageFromForm(locals.supabase, params.projectId, subject, user.id, formData);
	},
	addParticipant: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const subject = { goalId: params.goalId };
		return addParticipantFromForm(
			locals.supabase,
			params.projectId,
			subject,
			await request.formData()
		);
	},
	removeParticipant: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const subject = { goalId: params.goalId };
		return removeParticipantFromForm(locals.supabase, subject, await request.formData());
	},
	deleteGoal: async ({ locals, params }) => {
		await requireProjectAccess(locals, params.projectId);
		await deleteGoal(locals.supabase, params.goalId);
		redirect(303, `/projects/${params.projectId}`);
	}
};
