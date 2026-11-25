import { describeDocumentRecording, describeDocumentUpload } from './describeDocumentUpload';
import { documentsPageAddress, type DocumentHome, type ReachedOwner } from './documentHomes';
import { findNamedDocument, reachNamedOwner } from './projectDocumentRuns';
import { grantDocumentUpload, keepWrittenDocument } from '$lib/server/projectDocuments/keepProjectDocument';
import { readText } from '../actionTypes';
import { recordDocumentUpload } from '$lib/server/projectDocuments/recordDocumentUpload';
import { removeProjectDocument } from '$lib/server/projectDocuments/changeProjectDocument';
import { validateDocumentGiven } from '$lib/projectDocuments/validateDocumentGiven';
import type { McpCaller } from '../resolveMcpCaller';
import type { DocumentGiven } from '$lib/projectDocuments/projectDocument';

type Input = Record<string, unknown>;

/** Keeps a written document on the owner at once, or keeps a file's document waiting for its file and gives the link to send it to. */
export function addDocumentRun(home: DocumentHome) {
	return async (caller: McpCaller, input: Input): Promise<string> => {
		const document = validateDocumentGiven(input);
		if (typeof document === 'string') return `Not added: ${document}. Nothing was kept.`;
		const reached = await reachNamedOwner(caller, home, input);
		if (reached === null) return home.unreachable;
		return keepGivenDocument(caller, home, reached, document);
	};
}

async function keepGivenDocument(caller: McpCaller, home: DocumentHome, reached: ReachedOwner, document: DocumentGiven): Promise<string> {
	const adder = { owner: reached.owner, accountId: caller.accountId };
	const { details, content } = document;
	if ('file' in content) {
		const grant = await grantDocumentUpload(caller.supabase, adder, details, content.file);
		return describeDocumentUpload(home, reached, details.title, content.file, grant);
	}
	const documentId = await keepWrittenDocument(caller.supabase, adder, details, content.markdown);
	return `"${details.title}" is on ${reached.name}'s documents as a ${details.status} (document id ${documentId}). Read it at ${documentsPageAddress(reached.owner)}.`;
}

/** Records that the file sent to a granted link arrived: a new document's first file, or a kept document's new version. */
export function recordDocumentRun(home: DocumentHome) {
	return async (caller: McpCaller, input: Input): Promise<string> => {
		const reached = await reachNamedOwner(caller, home, input);
		if (reached === null) return home.unreachable;
		const documentId = readText(input, 'documentId');
		const recording = await recordDocumentUpload(caller.supabase, { owner: reached.owner, accountId: caller.accountId }, documentId);
		return describeDocumentRecording(home, reached, documentId, recording);
	};
}

/** Takes a document, every version of it and its files off the owner. */
export function deleteDocumentRun(home: DocumentHome) {
	return async (caller: McpCaller, input: Input): Promise<string> => {
		const found = await findNamedDocument(caller, home, input);
		if (typeof found === 'string') return found;
		const { document, reached } = found;
		await removeProjectDocument(caller.supabase, document);
		return `"${document.title}" and every version of it are off ${reached.name}'s documents.`;
	};
}
