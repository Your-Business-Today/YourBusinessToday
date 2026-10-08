import { fail } from '@sveltejs/kit';
import { countUploadGrantsSince } from '$lib/server/projects/countUploadGrantsSince';
import { findTaskUploadGrant } from '$lib/server/projects/findTaskUploadGrant';
import { openTaskUploadGrant } from '$lib/server/projects/openTaskUploadGrant';
import {
	parseAttachmentUploadForm,
	parseUuidField
} from '$lib/server/projects/parseAttachmentUploadForm';
import { recordGrantedUpload } from '$lib/server/projects/recordGrantedUpload';
import { recordingRefusal } from '$lib/server/projects/recordingRefusal';
import {
	resolveUploadLinkHolder,
	type UploadLinkHolder
} from '$lib/server/auth/resolveUploadLinkHolder';
import { taskUploadLinkStart } from '$lib/server/projects/taskUploadLink';
import { validateAttachmentUpload } from '$lib/data/validateAttachmentUpload';
import type { Actions } from './$types';

const badRequestStatus = 400;
const notFoundStatus = 404;
const goneStatus = 410;
const tooManyRequestsStatus = 429;

export const mostFilesThroughOneLink = 50;

const linkHasStopped = 'This link has stopped working — ask Claude for a fresh one.';
const linkIsFull =
	`${mostFilesThroughOneLink} uploads have been started on this task since this link was made, ` +
	'which is as many as one link allows — ask Claude for a fresh one.';

async function hasTakenItsFill({ caller, task, link }: UploadLinkHolder): Promise<boolean> {
	const linkStart = taskUploadLinkStart(link);
	const { supabase, accountId } = caller;
	const startedCount = await countUploadGrantsSince(supabase, task.id, accountId, linkStart);
	return startedCount >= mostFilesThroughOneLink;
}

export const uploadActions: Actions = {
	grantUpload: async ({ params, request }) => {
		const holder = await resolveUploadLinkHolder(params.token);
		if (holder === null) return fail(goneStatus, { message: linkHasStopped });
		const upload = parseAttachmentUploadForm(await request.formData());
		if (upload === null) {
			return fail(badRequestStatus, { message: 'A file name, type, and size are required.' });
		}
		const problem = validateAttachmentUpload(upload);
		if (problem !== null) return fail(badRequestStatus, { message: problem });
		if (await hasTakenItsFill(holder)) return fail(tooManyRequestsStatus, { message: linkIsFull });
		const { caller, task } = holder;
		const grant = await openTaskUploadGrant(caller.supabase, task.id, caller.accountId, upload);
		return { uploadId: grant.grantId, uploadUrl: grant.uploadUrl };
	},
	recordUpload: async ({ params, request }) => {
		const holder = await resolveUploadLinkHolder(params.token);
		if (holder === null) return fail(goneStatus, { message: linkHasStopped });
		const { caller, task } = holder;
		const uploadId = parseUuidField(await request.formData(), 'uploadId');
		if (uploadId === null) return fail(badRequestStatus, { message: 'An upload is required.' });
		const grant = await findTaskUploadGrant(caller.supabase, task.id, uploadId, caller.accountId);
		if (grant === null) {
			return fail(notFoundStatus, { message: 'That upload was not started from this page.' });
		}
		const refusal = recordingRefusal(await recordGrantedUpload(caller.supabase, grant));
		if (refusal !== null) return fail(badRequestStatus, { message: refusal });
		return {};
	}
};
