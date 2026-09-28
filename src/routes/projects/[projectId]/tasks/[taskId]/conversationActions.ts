import { fail } from '@sveltejs/kit';
import { getProject } from '$lib/server/projects/getProject';
import { getTask } from '$lib/server/projects/getTask';
import { longestMessageBody } from '$lib/server/conversations/postMessage';
import { postMessageFromForm } from '$lib/server/conversations/postMessageFromForm';
import {
	addParticipantFromForm,
	removeParticipantFromForm
} from '$lib/server/conversations/participantFormActions';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { resolveSupportTask } from '$lib/server/support/resolveSupportTask';
import type { Actions } from './$types';

export const conversationActions = {
	postMessage: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const subject = { taskId: params.taskId };
		const formData = await request.formData();
		return postMessageFromForm(locals.supabase, params.projectId, subject, user.id, formData);
	},
	addParticipant: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const subject = { taskId: params.taskId };
		return addParticipantFromForm(
			locals.supabase,
			params.projectId,
			subject,
			await request.formData()
		);
	},
	removeParticipant: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const subject = { taskId: params.taskId };
		return removeParticipantFromForm(locals.supabase, subject, await request.formData());
	},
	resolve: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const resolution = String((await request.formData()).get('resolution') ?? '').trim();
		if (resolution === '' || resolution.length > longestMessageBody) {
			return fail(400, {
				message: `The resolution needs some words, fewer than ${longestMessageBody}.`
			});
		}
		const [task, project] = await Promise.all([
			getTask(locals.supabase, params.taskId),
			getProject(locals.supabase, params.projectId)
		]);
		if (task === null || project === null || task.kind !== 'support') {
			return fail(400, {
				message: 'Only a support task is resolved this way.'
			});
		}
		await resolveSupportTask(locals.supabase, task, project, resolution, user.id);
		return { message: 'Resolved, with your answer posted for them to read.' };
	}
} satisfies Actions;
