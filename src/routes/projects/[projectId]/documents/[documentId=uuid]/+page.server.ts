import { readDocumentMarkdown } from '$lib/server/projectDocuments/findProjectDocuments';
import { renderDocumentHtml } from '$lib/server/projectDocuments/renderDocumentHtml';
import { requireProjectDocument } from '$lib/server/projectDocuments/requireProjectDocument';
import { signDocumentViewLink } from '$lib/server/projectDocuments/signDocumentViewLink';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project, document } = await requireProjectDocument(locals, params.projectId, params.documentId);
	if (document.storagePath === null) {
		const markdown = await readDocumentMarkdown(locals.supabase, document);
		return { project, document, documentHtml: renderDocumentHtml(markdown), viewUrl: null };
	}
	return { project, document, documentHtml: null, viewUrl: await signDocumentViewLink(locals.supabase, document.storagePath) };
};
