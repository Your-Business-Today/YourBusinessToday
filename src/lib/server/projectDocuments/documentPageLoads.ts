import { error, redirect } from '@sveltejs/kit';
import { downloadWrittenDocument } from './downloadWrittenDocument';
import { findDocumentVersion, readDocumentVersions, readVersionMarkdown } from './findDocumentVersions';
import { findKeptDocument, readDocumentMarkdown, readKeptDocuments } from './findProjectDocuments';
import { projectDocumentBucket } from './projectDocumentFiles';
import { readDocumentInput } from './readDocumentInput';
import { renderDocumentHtml } from './renderDocumentHtml';
import { signDocumentViewLink } from './signDocumentViewLink';
import { signFetchLink } from '$lib/server/storage/signFetchLink';
import { versionNumberAt, writtenDownloadKindAt } from '$lib/components/projects/documents/documentAddress';
import type { DocumentPageOwner, ReachPageOwner } from './documentPageOwner';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

const notFound = 404;
const seeOther = 303;

type PageEvent = { locals: App.Locals; params: Record<string, string>; url: URL };

/** The owner's documents, for its Documents page. */
export async function loadDocumentShelf(reachOwner: ReachPageOwner, { locals, params }: PageEvent) {
	const pageOwner = await reachOwner(locals, params);
	return { pageOwner, documents: await readKeptDocuments(locals.supabase, pageOwner.owner) };
}

async function requireDocument(reachOwner: ReachPageOwner, { locals, params }: PageEvent): Promise<{ pageOwner: DocumentPageOwner; document: KeptDocument }> {
	const pageOwner = await reachOwner(locals, params);
	const document = await findKeptDocument(locals.supabase, pageOwner.owner, params.documentId);
	if (document === null) error(notFound, 'There is no such document here.');
	return { pageOwner, document };
}

/** One document as its page reads it: written ones as HTML, files in a viewer, with every version and the input asked on it. */
export async function loadDocumentReading(reachOwner: ReachPageOwner, event: PageEvent) {
	const { pageOwner, document } = await requireDocument(reachOwner, event);
	const { supabase } = event.locals;
	const [versions, inputRequests] = await Promise.all([readDocumentVersions(supabase, document.id), readDocumentInput(supabase, document.id)]);
	const reading = { pageOwner, document, versions, inputRequests };
	if (document.storagePath === null) {
		const markdown = await readDocumentMarkdown(supabase, document);
		return { ...reading, documentHtml: renderDocumentHtml(markdown), viewUrl: null };
	}
	return { ...reading, documentHtml: null, viewUrl: await signDocumentViewLink(supabase, document.storagePath) };
}

/** A document as a file to save, at the version its address names or the one it holds now. */
export async function downloadDocument(reachOwner: ReachPageOwner, event: PageEvent): Promise<Response> {
	const { document } = await requireDocument(reachOwner, event);
	const { locals, url } = event;
	const { supabase } = locals;
	const versionNumber = versionNumberAt(url) ?? document.versionNumber;
	const version = await findDocumentVersion(supabase, document.id, versionNumber);
	if (version === null) error(notFound, 'There is no such version of this document.');
	const { storagePath, filename } = version;
	if (storagePath === null) {
		const markdown = await readVersionMarkdown(supabase, version);
		return downloadWrittenDocument(markdown, filename, writtenDownloadKindAt(url));
	}
	redirect(seeOther, await signFetchLink(supabase, projectDocumentBucket, { storagePath, filename }));
}
