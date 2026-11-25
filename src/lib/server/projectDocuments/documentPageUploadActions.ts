import { fail } from '@sveltejs/kit';
import { findKeptDocument } from './findProjectDocuments';
import { grantDocumentUpload } from './keepProjectDocument';
import { grantVersionUpload } from './keepDocumentVersion';
import { readDocumentForm } from './readDocumentForm';
import { recordDocumentUpload } from './recordDocumentUpload';
import { recordingRefusals } from './documentRecordingRefusals';
import { validateDocumentFile, validateDocumentGiven } from '$lib/projectDocuments/validateDocumentGiven';
import type { DocumentPageRequest, ReachPageOwner } from './documentPageOwner';

const badRequest = 400;
const notFound = 404;

/** The page's doors for a file: grant a new document's upload or a kept one's new version, then record what arrived. */
export function documentPageUploadActions(reachOwner: ReachPageOwner) {
	return {
		grantDocument: async ({ locals, params, request }: DocumentPageRequest) => {
			const { owner, accountId } = await reachOwner(locals, params);
			const given = validateDocumentGiven(readDocumentForm(await request.formData()));
			if (typeof given === 'string') return fail(badRequest, { message: `Not added: ${given}.` });
			const { details, content } = given;
			if (!('file' in content)) return fail(badRequest, { message: 'Choose a file to send.' });
			return grantDocumentUpload(locals.supabase, { owner, accountId }, details, content.file);
		},
		grantVersion: async ({ locals, params, request }: DocumentPageRequest) => {
			const { owner, accountId } = await reachOwner(locals, params);
			const form = readDocumentForm(await request.formData());
			const given = validateDocumentFile(form);
			if (typeof given === 'string') return fail(badRequest, { message: `Not sent: ${given}.` });
			const document = await findKeptDocument(locals.supabase, owner, String(form.documentId ?? ''));
			if (document === null) return fail(notFound, { message: 'That document is no longer here.' });
			const grant = await grantVersionUpload(locals.supabase, document, accountId, given.file);
			return { documentId: document.id, uploadUrl: grant.uploadUrl };
		},
		recordDocument: async ({ locals, params, request }: DocumentPageRequest) => {
			const { owner, accountId } = await reachOwner(locals, params);
			const { documentId } = readDocumentForm(await request.formData());
			const recording = await recordDocumentUpload(locals.supabase, { owner, accountId }, String(documentId ?? ''));
			const refusal = recordingRefusals[recording.status];
			if (refusal !== undefined) return fail(badRequest, { message: refusal });
			return {};
		}
	};
}
