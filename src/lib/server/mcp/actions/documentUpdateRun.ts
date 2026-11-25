import { changeDocumentDetails } from '$lib/server/projectDocuments/changeProjectDocument';
import { describeDocumentUpload } from './describeDocumentUpload';
import { documentsPageAddress, type DocumentHome, type ReachedOwner } from './documentHomes';
import { findNamedDocument } from './projectDocumentRuns';
import { grantVersionUpload, keepWrittenVersion } from '$lib/server/projectDocuments/keepDocumentVersion';
import { validateDocumentChanges, type DocumentChanges } from '$lib/projectDocuments/validateDocumentChanges';
import type { McpCaller } from '../resolveMcpCaller';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

type Input = Record<string, unknown>;
type Changing = { caller: McpCaller; home: DocumentHome; reached: ReachedOwner; document: KeptDocument };

/** Changes a document's words, place or standing, and keeps new text or a new file as its next version. */
export function updateDocumentRun(home: DocumentHome) {
	return async (caller: McpCaller, input: Input): Promise<string> => {
		const changes = validateDocumentChanges(input);
		if (typeof changes === 'string') return `Not changed: ${changes}. Nothing was changed.`;
		const found = await findNamedDocument(caller, home, input);
		if (typeof found === 'string') return found;
		await changeDocumentDetails(caller.supabase, found.document, changes.details);
		return keepNewVersion({ caller, home, ...found }, changes);
	};
}

async function keepNewVersion(changing: Changing, changes: DocumentChanges): Promise<string> {
	const { caller, home, reached, document } = changing;
	const { details, named, newVersion } = changes;
	const title = details.title ?? document.title;
	const changed = `"${title}" is changed: ${named.join(', ')}.`;
	if (newVersion === null) return `${changed} It shows at ${documentsPageAddress(reached.owner)}.`;
	if ('markdown' in newVersion) {
		const versionNumber = await keepWrittenVersion(caller.supabase, { ...document, title }, caller.accountId, newVersion.markdown);
		return `${changed} Its new text is version ${versionNumber}; version ${document.versionNumber} is kept as it was.`;
	}
	const grant = await grantVersionUpload(caller.supabase, document, caller.accountId, newVersion.file);
	const upload = describeDocumentUpload(home, reached, title, newVersion.file, { documentId: document.id, uploadUrl: grant.uploadUrl });
	return `${changed} The file becomes version ${grant.versionNumber} once it is recorded.\n${upload}`;
}
