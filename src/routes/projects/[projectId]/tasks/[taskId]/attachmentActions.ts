import { fail } from '@sveltejs/kit';
import { attachmentLimitDescription, isWithinAttachmentLimit } from '$lib/data/taskAttachmentRules';
import { deleteTaskAttachment } from '$lib/server/projects/deleteTaskAttachment';
import { findTaskAttachment } from '$lib/server/projects/findTaskAttachment';
import { grantAttachmentUpload } from '$lib/server/projects/grantAttachmentUpload';
import {
	parseAttachmentId,
	parseAttachmentUploadForm
} from '$lib/server/projects/parseAttachmentUploadForm';
import { attachmentRecordings, recordTaskAttachment } from '$lib/server/projects/recordTaskAttachment';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';

export const attachmentActions: Actions = {
	grantAttachment: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const upload = parseAttachmentUploadForm(await request.formData());
		if (upload === null) return fail(400, { message: 'A file name, type, and size are required.' });
		if (!isWithinAttachmentLimit(upload.byteCount)) {
			return fail(400, { message: `That file is too large. ${attachmentLimitDescription()}` });
		}
		return grantAttachmentUpload(locals.supabase, params.taskId, upload.filename);
	},
	recordAttachment: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const upload = parseAttachmentUploadForm(formData);
		const attachmentId = parseAttachmentId(formData);
		if (upload === null || attachmentId === null) {
			return fail(400, { message: 'An attachment is required.' });
		}
		const recording = await recordTaskAttachment(
			locals.supabase,
			params.taskId,
			attachmentId,
			user.id,
			upload
		);
		if (recording === attachmentRecordings.fileMissing) {
			return fail(400, { message: 'The file never reached storage — please try again.' });
		}
		return {};
	},
	deleteAttachment: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const attachmentId = parseAttachmentId(await request.formData());
		if (attachmentId === null) return fail(400, { message: 'An attachment is required.' });
		const attachment = await findTaskAttachment(locals.supabase, params.taskId, attachmentId);
		if (attachment === null) return fail(404, { message: 'That attachment is already gone.' });
		await deleteTaskAttachment(locals.supabase, attachment);
		return {};
	}
};
