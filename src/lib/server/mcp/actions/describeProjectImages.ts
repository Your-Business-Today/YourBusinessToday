import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { elapsedPhrase } from '$lib/data/elapsedTime';
import { withUploaderNames } from '$lib/server/projects/uploaderNames';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectImage } from '$lib/server/projectImages/projectImageRecord';

export const noSuchProjectImage =
	'No unassigned image has that id on that project. Call find_project_images to see the bank.';

export function projectImageLines(
	project: Project,
	images: ProjectImage[],
	people: Account[]
): string[] {
	if (images.length === 0) return [`No unassigned images on ${project.name}.`];
	const lines = withUploaderNames(images, people).map(
		(image) =>
			`- ${image.filename} (${describeByteCount(image.byteCount)}, ${image.mimeType}, ` +
			`uploaded by ${image.uploaderName} ${elapsedPhrase(image.createdAt)}; image id: ${image.id})`
	);
	return [`Unassigned images on ${project.name}, newest first:`, ...lines];
}

export function matchesWords({ filename }: ProjectImage, words: string): boolean {
	const lowerCaseFilename = filename.toLowerCase();
	const searchWords = words.toLowerCase().split(/\s+/).filter((word) => word !== '');
	return searchWords.every((word) => lowerCaseFilename.includes(word));
}
