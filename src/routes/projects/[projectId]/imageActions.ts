import { fail } from '@sveltejs/kit';
import { assignProjectImage } from '$lib/server/projectImages/assignProjectImage';
import { deleteProjectImage } from '$lib/server/projectImages/deleteProjectImage';
import { findProjectImage } from '$lib/server/projectImages/findProjectImage';
import { getTask } from '$lib/server/projects/getTask';
import { grantProjectImageUpload } from '$lib/server/projectImages/grantProjectImageUpload';
import {
	parseAttachmentUploadForm,
	parseUuidField
} from '$lib/server/projects/parseAttachmentUploadForm';
import { projectImageUploadProblem } from '$lib/data/projectImageRules';
import { recordProjectImage } from '$lib/server/projectImages/recordProjectImage';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';

const imageGone = 'That image is no longer in the bank.';

export const imageActions: Actions = {
	grantImage: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const upload = parseAttachmentUploadForm(await request.formData());
		if (upload === null) return fail(400, { message: 'A file name, type, and size are required.' });
		const problem = projectImageUploadProblem(upload);
		if (problem !== null) return fail(400, { message: problem });
		return grantProjectImageUpload(locals.supabase, project.id, upload.filename);
	},
	recordImage: async ({ locals, params, request }) => {
		const { project, user } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const upload = parseAttachmentUploadForm(formData);
		const imageId = parseUuidField(formData, 'imageId');
		if (upload === null || imageId === null) return fail(400, { message: 'An image is required.' });
		const problem = projectImageUploadProblem(upload);
		if (problem !== null) return fail(400, { message: problem });
		const image = { projectId: project.id, imageId, uploadedBy: user.id, upload };
		const recording = await recordProjectImage(locals.supabase, image);
		if (recording === 'file_missing') {
			return fail(400, { message: 'The image never reached storage — please try again.' });
		}
		return {};
	},
	deleteImage: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const imageId = String((await request.formData()).get('imageId') ?? '');
		const image = await findProjectImage(locals.supabase, project.id, imageId);
		if (image === null) return fail(404, { message: imageGone });
		await deleteProjectImage(locals.supabase, image);
		return {};
	},
	assignImage: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const image = await findProjectImage(locals.supabase, project.id, String(formData.get('imageId') ?? ''));
		if (image === null) return fail(404, { message: imageGone });
		const taskId = parseUuidField(formData, 'taskId');
		const task = taskId === null ? null : await getTask(locals.supabase, taskId);
		if (task === null || task.projectId !== project.id) {
			return fail(400, { message: 'Choose a task on this project.' });
		}
		const isAssigned = await assignProjectImage(locals.supabase, image, task);
		if (!isAssigned) return fail(404, { message: imageGone });
		return {};
	}
};
