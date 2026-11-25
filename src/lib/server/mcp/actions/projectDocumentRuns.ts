import { describeOwnedDocuments } from './describeOwnedDocuments';
import { findKeptDocument, readKeptDocuments } from '$lib/server/projectDocuments/findProjectDocuments';
import { noSuchDocumentIn, type DocumentHome, type ReachedOwner } from './documentHomes';
import { readDocumentInFull } from './readDocumentInFull';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

type Input = Record<string, unknown>;

/** The owner the input names, if the caller reaches it. */
export async function reachNamedOwner(caller: McpCaller, home: DocumentHome, input: Input): Promise<ReachedOwner | null> {
	return home.reach(caller, readText(input, home.idField));
}

/** The kept document the input names on the owner it names, or the sentence that refuses it. */
export async function findNamedDocument(caller: McpCaller, home: DocumentHome, input: Input): Promise<{ reached: ReachedOwner; document: KeptDocument } | string> {
	const reached = await reachNamedOwner(caller, home, input);
	if (reached === null) return home.unreachable;
	const document = await findKeptDocument(caller.supabase, reached.owner, readText(input, 'documentId'));
	if (document === null) return noSuchDocumentIn(home);
	return { reached, document };
}

/** The owner's documents, outputs then inputs, section by section, in the order they are listed. */
export function listDocumentsRun(home: DocumentHome) {
	return async (caller: McpCaller, input: Input): Promise<string> => {
		const reached = await reachNamedOwner(caller, home, input);
		if (reached === null) return home.unreachable;
		return describeOwnedDocuments(home, reached, await readKeptDocuments(caller.supabase, reached.owner));
	};
}

/** One of the owner's documents in full, at the version named or the one it holds now, with its versions and the input asked on it. */
export function readDocumentRun(home: DocumentHome) {
	return async (caller: McpCaller, input: Input): Promise<string> => {
		const found = await findNamedDocument(caller, home, input);
		if (typeof found === 'string') return found;
		return readDocumentInFull(caller.supabase, found.document, input.versionNumber);
	};
}
