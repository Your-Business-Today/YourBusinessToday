import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { libraryUploadLinkLifetimeHours } from '$lib/brand/library/libraryLimits';
import { libraryUploadRecordings, type LibraryUploadRecording } from '$lib/server/brandLibrary/recordLibraryUpload';
import type { GrantedLibraryUpload } from '$lib/server/brandLibrary/grantLibraryUpload';
import type { LibraryItemGiven } from '$lib/brand/library/libraryItem';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const recordLibraryItemAction = 'record_brand_library_item';

/** The link the file goes to, the command that sends it, and the call that keeps it in the library. */
export function describeLibraryUpload(organisation: Organisation, item: LibraryItemGiven, grant: GrantedLibraryUpload): string {
	const { filename, mimeType } = item;
	return [
		`Upload link for "${filename}" in ${organisation.name}’s Brand library, to be used once within ${libraryUploadLinkLifetimeHours} hours. ` +
			`Send the file to it as an HTTP PUT with the raw bytes as the body and content-type ${mimeType}, for example:`,
		`curl --fail --upload-file <path to the file> -H "content-type: ${mimeType}" "${grant.uploadUrl}"`,
		`Then call ${recordLibraryItemAction} with organisationId ${organisation.id} and itemId ${grant.itemId}: ` +
			'only then does it show in the library.',
		'If your own network refuses the PUT, a proxy answering 403 or the address not reached, retrying will not help: ' +
			'the person adds the file on the Brand place’s Photos and videos page instead.'
	].join('\n');
}

const recordingSentences: Record<string, string> = {
	[libraryUploadRecordings.notGranted]: 'No upload of that itemId was started by you on this brand. Call add_brand_library_item for one.',
	[libraryUploadRecordings.notArrived]: 'Nothing has arrived at that link yet. Send the file with the PUT first, then call again.',
	[libraryUploadRecordings.lapsed]:
		`That link lapsed ${libraryUploadLinkLifetimeHours} hours after it was granted, so the item was let go. Call add_brand_library_item again.`,
	[libraryUploadRecordings.alreadyRecorded]: 'That file is already in the library. Call list_brand_library to see it.'
};

/** What recording the file found, in a sentence for the Claude that sent it. */
export function describeLibraryRecording(organisation: Organisation, itemId: string, recording: LibraryUploadRecording): string {
	const isRecorded = recording.status === libraryUploadRecordings.recorded;
	if (!isRecorded) return recordingSentences[recording.status];
	return `Kept in ${organisation.name}’s Brand library (${describeByteCount(recording.byteCount)}, item id ${itemId}).`;
}
