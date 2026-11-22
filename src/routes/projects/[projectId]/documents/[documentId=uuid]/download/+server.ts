import { redirect } from '@sveltejs/kit';
import { downloadWrittenDocument } from '$lib/server/projectDocuments/downloadWrittenDocument';
import { requireProjectDocument } from '$lib/server/projectDocuments/requireProjectDocument';
import { signFetchLink } from '$lib/server/storage/signFetchLink';
import { projectDocumentBucket } from '$lib/server/projectDocuments/projectDocumentFiles';
import { writtenDownloadKindAt } from '$lib/components/projects/documents/documentAddress';
import type { RequestHandler } from './$types';

const seeOther = 303;

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const { document } = await requireProjectDocument(locals, params.projectId, params.documentId);
	const { storagePath, filename } = document;
	const writtenKind = writtenDownloadKindAt(url);
	if (storagePath === null) return downloadWrittenDocument(locals.supabase, document, writtenKind);
	const fetchLink = await signFetchLink(locals.supabase, projectDocumentBucket, { storagePath, filename });
	redirect(seeOther, fetchLink);
};
