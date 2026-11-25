import { error } from '@sveltejs/kit';
import { renderDocumentHtml } from '$lib/server/projectDocuments/renderDocumentHtml';
import { readPackDocumentText } from '$lib/server/contractPacks/portalContractPack';
import { documentInPack } from '$lib/server/contractPacks/packSigningRefusals';
import { commentOnPack, requirePortalPack, signPackDocument } from '$lib/server/contractPacks/portalPackDoors';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import type { Actions, PageServerLoad } from './$types';

const httpNotFound = 404;
const notInPack = 'That document is not in your contract pack.';

/** One document of the client's pack as it stands now, its comments and its signature, to read, comment on and sign. */
export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	const { client, pack } = await requirePortalPack(page.locals);
	const { documentId } = page.params;
	const document = documentInPack(pack, documentId);
	const markdown = await readPackDocumentText(client.service, pack, documentId);
	if (document === null || markdown === null) error(httpNotFound, notInPack);
	const comments = pack.comments.filter((comment) => comment.documentId === documentId);
	return { visitor, document, comments, documentHtml: renderDocumentHtml(markdown), today: new Date().toISOString().slice(0, 10) };
};

export const actions = {
	comment: async ({ locals, request }) => commentOnPack(locals, await request.formData()),
	sign: async ({ locals, request }) => signPackDocument(locals, await request.formData())
} satisfies Actions;
