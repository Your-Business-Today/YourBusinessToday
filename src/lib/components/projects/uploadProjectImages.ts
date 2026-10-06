import { projectImageUploadProblem } from '$lib/data/projectImageRules';
import {
	describeUpload,
	projectImageUploadActions,
	uploadProgressLabel,
	uploadOutcomeStatuses,
	uploadThroughSignedLink
} from './uploadThroughSignedLink';

/** Uploads the images one at a time into the bank, and says why the first that failed did. */
export async function uploadProjectImages(
	files: File[],
	showProgress: (label: string) => void
): Promise<string | null> {
	for (const [index, file] of files.entries()) {
		showProgress(uploadProgressLabel(index, files.length, file.name));
		const problem = projectImageUploadProblem(describeUpload(file));
		if (problem !== null) return `${file.name}: ${problem}`;
		const outcome = await uploadThroughSignedLink(file, projectImageUploadActions);
		if (outcome.status === uploadOutcomeStatuses.failed) return `${file.name}: ${outcome.message}`;
	}
	return null;
}
