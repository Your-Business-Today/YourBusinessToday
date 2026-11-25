import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { findClientDocumentEntry } from '$lib/data/clientDocumentCatalogue';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import { readClientDocumentBySlug } from '$lib/server/clientDocuments/readClientDocumentBySlug';
import { readOptionalClauseReadings } from '$lib/server/clientDocuments/readOptionalClauseReadings';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireAdmin(locals);
	const entry = findClientDocumentEntry(params.slug);
	const markdown = readClientDocumentBySlug(params.slug);
	if (!entry || markdown === undefined) error(404, 'There is no such document.');
	const optionalClauses = await readOptionalClauseReadings(params.slug);
	return { entry, documentHtml: await marked.parse(markdown), optionalClauses };
};
