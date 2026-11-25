import { fail } from '@sveltejs/kit';
import { documentPageUploadActions } from './documentPageUploadActions';
import { findKeptDocument } from './findProjectDocuments';
import { keepWrittenDocument } from './keepProjectDocument';
import { keepWrittenVersion } from './keepDocumentVersion';
import { checkMarkdown } from '$lib/projectDocuments/documentFieldChecks';
import { readDocumentForm } from './readDocumentForm';
import { changeDocumentDetails, removeProjectDocument } from './changeProjectDocument';
import { validateDocumentDetailChanges } from '$lib/projectDocuments/validateDocumentDetails';
import { validateDocumentGiven } from '$lib/projectDocuments/validateDocumentGiven';
import type { DocumentPageRequest, ReachPageOwner } from './documentPageOwner';

const badRequest = 400;
const notFound = 404;

/** A Documents page's own doors, on a product or an organisation: send a file or a new version, write one from Markdown, change its details, and take one off. */
export function documentPageActions(reachOwner: ReachPageOwner) {
	return { ...documentPageUploadActions(reachOwner), ...writingActions(reachOwner), ...keptDocumentActions(reachOwner) };
}

function writingActions(reachOwner: ReachPageOwner) {
	return {
		writeDocument: async ({ locals, params, request }: DocumentPageRequest) => {
			const { owner, accountId } = await reachOwner(locals, params);
			const given = validateDocumentGiven(readDocumentForm(await request.formData()));
			if (typeof given === 'string') return fail(badRequest, { message: `Not added: ${given}.` });
			const { details, content } = given;
			if (!('markdown' in content)) return fail(badRequest, { message: 'A written document needs its text.' });
			await keepWrittenDocument(locals.supabase, { owner, accountId }, details, content.markdown);
			return {};
		},
		writeVersion: async ({ locals, params, request }: DocumentPageRequest) => {
			const { owner, accountId } = await reachOwner(locals, params);
			const form = readDocumentForm(await request.formData());
			const markdown = checkMarkdown(form.markdown);
			if ('refusal' in markdown) return fail(badRequest, { message: `Not kept: ${markdown.refusal}.` });
			const document = await findKeptDocument(locals.supabase, owner, String(form.documentId ?? ''));
			if (document === null) return fail(notFound, { message: 'That document is no longer here.' });
			await keepWrittenVersion(locals.supabase, document, accountId, markdown.value);
			return {};
		}
	};
}

function keptDocumentActions(reachOwner: ReachPageOwner) {
	return {
		changeDocument: async ({ locals, params, request }: DocumentPageRequest) => {
			const { owner } = await reachOwner(locals, params);
			const form = readDocumentForm(await request.formData());
			const changes = validateDocumentDetailChanges({ summary: '', ...form });
			if (typeof changes === 'string') return fail(badRequest, { message: `Not changed: ${changes}.` });
			const document = await findKeptDocument(locals.supabase, owner, String(form.documentId ?? ''));
			if (document === null) return fail(notFound, { message: 'That document is no longer here.' });
			await changeDocumentDetails(locals.supabase, document, changes);
			return {};
		},
		deleteDocument: async ({ locals, params, request }: DocumentPageRequest) => {
			const { owner } = await reachOwner(locals, params);
			const { documentId } = readDocumentForm(await request.formData());
			const document = await findKeptDocument(locals.supabase, owner, String(documentId ?? ''));
			if (document === null) return fail(notFound, { message: 'That document is already gone.' });
			await removeProjectDocument(locals.supabase, document);
			return {};
		}
	};
}
