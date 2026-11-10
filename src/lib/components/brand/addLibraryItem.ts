import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import { brandLibraryUploadActions, libraryLimitHint } from './brandLibraryPageWords';
import { uploadOutcomeStatuses, uploadThroughSignedLink } from '$lib/components/projects/uploadThroughSignedLink';

const describedFields = ['shows', 'takenOn', 'posting', 'permissionGivenBy'];

/** What the form says of the file: each described field as typed, and none that was left out. */
function describedAs(formData: FormData): Record<string, string> {
	const given = describedFields.map((field) => [field, formData.get(field)] as const);
	return Object.fromEntries(given.filter(([, value]) => typeof value === 'string')) as Record<string, string>;
}

/** Sends the chosen photo or video with what the form says of it; the reason it was not added, or null when it was. */
export async function addLibraryItem(form: HTMLFormElement): Promise<string | null> {
	const formData = new FormData(form);
	const file = formData.get('file');
	const isFileChosen = file instanceof File && file.size > 0;
	if (!isFileChosen) return 'Choose a photo or video to add.';
	if (file.size > LibraryLimits.largestByteCount) return `That file is too large. ${libraryLimitHint}`;
	const outcome = await uploadThroughSignedLink(file, brandLibraryUploadActions, describedAs(formData));
	if (outcome.status === uploadOutcomeStatuses.failed) return outcome.message;
	return null;
}
