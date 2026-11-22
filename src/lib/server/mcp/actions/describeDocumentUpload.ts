import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { addProjectDocumentAction, documentsPageAddress, listProjectDocumentsAction, recordProjectDocumentAction } from './describeProjectDocuments';
import { documentUploadLinkLifetimeHours } from '$lib/projectDocuments/documentLimits';
import { documentUploadRecordings, type DocumentUploadRecording } from '$lib/server/projectDocuments/recordDocumentUpload';
import type { DocumentFileGiven } from '$lib/projectDocuments/projectDocument';
import type { GrantedDocumentUpload } from '$lib/server/projectDocuments/grantedDocumentUpload';
import type { Project } from '$lib/server/projects/projectRecord';

/** The link the file goes to, the command that sends it, and the call that puts the document on the project. */
export function describeDocumentUpload(project: Project, title: string, file: DocumentFileGiven, grant: GrantedDocumentUpload): string {
	return [
		`Upload link for "${title}" on ${project.name}, to be used once within ${documentUploadLinkLifetimeHours} hours. ` +
			`Send the file "${file.filename}" to it as an HTTP PUT with the raw bytes as the body, for example:`,
		`curl --fail --upload-file <path to the file> -H "content-type: ${file.mimeType}" "${grant.uploadUrl}"`,
		`Then call ${recordProjectDocumentAction} with projectId ${project.id} and documentId ${grant.documentId}: only then does it show on the project.`,
		'If your own network refuses the PUT, a proxy answering 403 or the address not reached, retrying will not help: ' +
			'send it from a Claude whose network reaches the file store, such as Claude Code on the person’s own computer.'
	].join('\n');
}

const recordingSentences: Record<string, string> = {
	[documentUploadRecordings.notGranted]: `No upload of that documentId was started by you on this project. Call ${addProjectDocumentAction} for one.`,
	[documentUploadRecordings.notArrived]: 'Nothing has arrived at the file’s link yet. Send the file with the PUT first, then call again.',
	[documentUploadRecordings.lapsed]: `That link lapsed ${documentUploadLinkLifetimeHours} hours after it was granted. Call ${addProjectDocumentAction} again.`,
	[documentUploadRecordings.alreadyRecorded]: `That document is already on the project. Call ${listProjectDocumentsAction} to see it.`
};

/** What recording the document's file found, in a sentence for the Claude that sent it. */
export function describeDocumentRecording(project: Project, documentId: string, recording: DocumentUploadRecording): string {
	if (recording.status !== documentUploadRecordings.recorded) return recordingSentences[recording.status];
	return `On ${project.name}'s documents (${describeByteCount(recording.byteCount)}, document id ${documentId}). Read it at ${documentsPageAddress(project)}.`;
}
