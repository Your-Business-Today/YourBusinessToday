import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { documentsPageAddress, type DocumentHome, type ReachedOwner } from './documentHomes';
import { documentUploadLinkLifetimeHours } from '$lib/projectDocuments/documentLimits';
import { documentUploadRecordings, type DocumentUploadRecording } from '$lib/server/projectDocuments/recordDocumentUpload';
import type { DocumentFileGiven } from '$lib/projectDocuments/projectDocument';

/** A file's upload as granted: the link it goes to, and the document it is kept on once it arrives. */
export type GrantedFile = { documentId: string; uploadUrl: string };

/** The link the file goes to, the command that sends it, and the call that keeps it on the owner's documents. */
export function describeDocumentUpload(home: DocumentHome, reached: ReachedOwner, title: string, file: DocumentFileGiven, grant: GrantedFile): string {
	const { names } = home;
	const { owner } = reached;
	return [
		`Upload link for "${title}" on ${reached.name}, to be used once within ${documentUploadLinkLifetimeHours} hours. ` +
			`Send the file "${file.filename}" to it as an HTTP PUT with the raw bytes as the body, for example:`,
		`curl --fail --upload-file <path to the file> -H "content-type: ${file.mimeType}" "${grant.uploadUrl}"`,
		`Then call ${names.record} with ${home.idField} ${owner.id} and documentId ${grant.documentId}: only then is it kept.`,
		'If your own network refuses the PUT, a proxy answering 403 or the address not reached, retrying will not help: ' +
			'send it from a Claude whose network reaches the file store, such as Claude Code on the person’s own computer.'
	].join('\n');
}

function recordingSentences(home: DocumentHome): Record<string, string> {
	const { names } = home;
	return {
		[documentUploadRecordings.notGranted]: `No upload of that documentId was started by you on this ${home.noun}. Call ${names.add}, or ${names.update} with a file, for one.`,
		[documentUploadRecordings.notArrived]: 'Nothing has arrived at the file’s link yet. Send the file with the PUT first, then call again.',
		[documentUploadRecordings.lapsed]: `That link lapsed ${documentUploadLinkLifetimeHours} hours after it was granted. Ask for a new one and send the file again.`,
		[documentUploadRecordings.alreadyRecorded]: `That file is already kept. Call ${names.list} to see it.`
	};
}

/** What recording the document's file found, in a sentence for the Claude that sent it. */
export function describeDocumentRecording(home: DocumentHome, reached: ReachedOwner, documentId: string, recording: DocumentUploadRecording): string {
	if (recording.status !== documentUploadRecordings.recorded) return recordingSentences(home)[recording.status];
	return `Kept on ${reached.name}'s documents (${describeByteCount(recording.byteCount)}, document id ${documentId}). Read it at ${documentsPageAddress(reached.owner)}.`;
}
