import { businessBrainUploadLinkLifetimeHours } from '$lib/data/businessBrainFileRules';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { formatBritishDateTime } from '$lib/data/britishDate';
import type { BusinessBrainFile } from '$lib/server/businessBrain/businessBrainFileRecord';
import type { BusinessBrainFileGiven } from '$lib/data/businessBrainFileRules';
import type { GrantedBusinessBrainUpload } from '$lib/server/businessBrain/grantBusinessBrainFileUpload';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const noSuchBusinessBrainFile =
	"No upload link with that fileId was granted to you on this organisation's brain. Call grant_business_brain_file_upload for one.";

export function uploadGranted(organisation: Organisation, file: BusinessBrainFileGiven, granted: GrantedBusinessBrainUpload): string {
	const sendBy = formatBritishDateTime(granted.expiresAt);
	return [
		`Upload link for "${file.filename}" into ${organisation.name}'s Your Business Brain, to be used once, by ${sendBy} ` +
			`(${businessBrainUploadLinkLifetimeHours} hours from now). Send the raw bytes as an HTTP PUT with content-type ${file.mimeType}, for example:`,
		`curl --fail --upload-file <path to the file> -H "content-type: ${file.mimeType}" "${granted.uploadUrl}"`,
		`Then call record_business_brain_file_upload with organisationId ${organisation.id} and fileId ${granted.fileId}, ` +
			'and give that fileId in sourceFileIds when you file the pages you write from it.',
		'If your own network refuses the PUT — a proxy answers 403, or the address cannot be reached — the link is not at fault and ' +
			'retrying will not help: tell the person, and file the pages with the source named in sourceTitle and sourceOrigin alone.'
	].join('\n');
}

export function fileRecorded(organisation: Organisation, file: BusinessBrainFile, byteCount: number): string {
	return [
		`"${file.filename}" (${describeByteCount(byteCount)}) is kept in ${organisation.name}'s Your Business Brain (file id: ${file.id}).`,
		'Only people who use the brain of that organisation can read it, and nothing deletes it.',
		'Give the file id in sourceFileIds when you file the pages written from it.'
	].join('\n');
}

export const fileNotArrived = 'Nothing has arrived at that link yet. Send the file with the PUT first, then call again.';

export const linkLapsedUnused =
	'That link lapsed before anything was sent to it. Call grant_business_brain_file_upload for a fresh one.';

export function fileAlreadyRecorded(file: BusinessBrainFile): string {
	return `"${file.filename}" is already kept (file id: ${file.id}); give that id in sourceFileIds.`;
}

export function sourceFilesNotArrived(missingFileIds: string[]): string {
	return [
		`These sourceFileIds are not files that have arrived in this organisation's brain: ${missingFileIds.join(', ')}. Nothing was filed.`,
		'Give the fileId record_business_brain_file_upload gave back, once the file has been sent and recorded.'
	].join('\n');
}

export function withFilesNamed(answer: string, fileIds: string[]): string {
	if (fileIds.length === 0) return answer;
	const files = fileIds.length === 1 ? 'one source file' : `${fileIds.length} source files`;
	return `${answer}\nThe page names ${files} it was written from.`;
}

export function filesNamedOnUnchangedPage(fileIds: string[]): string {
	return withFilesNamed('The page already reads exactly so, so its text and history are unchanged.', fileIds);
}
