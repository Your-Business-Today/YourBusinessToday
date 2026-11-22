import { fail } from '@sveltejs/kit';
import { findKeptDocument } from '$lib/server/projectDocuments/findProjectDocuments';
import { grantDocumentUpload, keepWrittenDocument } from '$lib/server/projectDocuments/keepProjectDocument';
import { readDocumentForm } from '$lib/server/projectDocuments/readDocumentForm';
import { recordDocumentUpload } from '$lib/server/projectDocuments/recordDocumentUpload';
import { changeDocumentDetails, removeProjectDocument } from '$lib/server/projectDocuments/changeProjectDocument';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { validateDocumentDetailChanges } from '$lib/projectDocuments/validateDocumentDetails';
import { validateDocumentGiven } from '$lib/projectDocuments/validateDocumentGiven';
import { recordingRefusals } from './documentRecordingRefusals';
import type { Actions } from './$types';

const badRequest = 400;
const notFound = 404;

/** The Documents page's own doors: send a file, write a document from Markdown, change its title and summary, and take one off. */
export const documentActions: Actions = {
	grantDocument: async ({ locals, params, request }) => {
		const { user, project } = await requireProjectAccess(locals, params.projectId);
		const given = validateDocumentGiven(readDocumentForm(await request.formData()));
		if (typeof given === 'string') return fail(badRequest, { message: `Not added: ${given}.` });
		const { details, content } = given;
		if (!('file' in content)) return fail(badRequest, { message: 'Choose a file to send.' });
		const adder = { projectId: project.id, accountId: user.id };
		return grantDocumentUpload(locals.supabase, adder, details, content.file);
	},
	recordDocument: async ({ locals, params, request }) => {
		const { user, project } = await requireProjectAccess(locals, params.projectId);
		const { documentId } = readDocumentForm(await request.formData());
		const recording = await recordDocumentUpload(locals.supabase, { projectId: project.id, accountId: user.id }, String(documentId ?? ''));
		const refusal = recordingRefusals[recording.status];
		if (refusal !== undefined) return fail(badRequest, { message: refusal });
		return {};
	},
	writeDocument: async ({ locals, params, request }) => {
		const { user, project } = await requireProjectAccess(locals, params.projectId);
		const given = validateDocumentGiven(readDocumentForm(await request.formData()));
		if (typeof given === 'string') return fail(badRequest, { message: `Not added: ${given}.` });
		const { details, content } = given;
		if (!('markdown' in content)) return fail(badRequest, { message: 'A written document needs its text.' });
		await keepWrittenDocument(locals.supabase, { projectId: project.id, accountId: user.id }, details, content.markdown);
		return {};
	},
	changeDocument: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const changes = validateDocumentDetailChanges(readDocumentWords(formData));
		if (typeof changes === 'string') return fail(badRequest, { message: `Not changed: ${changes}.` });
		const document = await findKeptDocument(locals.supabase, project.id, String(formData.get('documentId') ?? ''));
		if (document === null) return fail(notFound, { message: 'That document is no longer on the project.' });
		await changeDocumentDetails(locals.supabase, document, changes);
		return {};
	},
	deleteDocument: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const { documentId } = readDocumentForm(await request.formData());
		const document = await findKeptDocument(locals.supabase, project.id, String(documentId ?? ''));
		if (document === null) return fail(notFound, { message: 'That document is already gone.' });
		await removeProjectDocument(locals.supabase, document);
		return {};
	}
};

/** The title and summary as typed; an emptied summary clears it, an emptied title is refused. */
function readDocumentWords(formData: FormData): Record<string, unknown> {
	return { title: String(formData.get('title') ?? ''), summary: String(formData.get('summary') ?? '') };
}
