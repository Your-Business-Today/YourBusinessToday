import { companyDetails } from '$lib/data/companyDetails';
import { excerptAsMarkdown } from '$lib/projectLibrary/libraryExcerpt';
import { libraryMatchHref, libraryMatchKindWords } from '$lib/components/projects/library/libraryMatchAddress';
import { libraryMatchKinds, type LibraryMatch } from '$lib/projectLibrary/libraryMatch';
import type { Project } from '$lib/server/projects/projectRecord';

export const librarySearchNotReadyYet =
	'Searching a project’s videos and documents is not ready yet: the migration behind it has not run. Use list_project_videos and list_project_documents meanwhile.';

const openingAction = { video: 'read_project_video with its video id', document: 'read_project_document with its document id' } as const;

/** What matches the words in the project's videos and documents, best first, each with where it is opened on the site. */
export function describeLibraryMatches(project: Project, words: string, matches: LibraryMatch[]): string {
	if (matches.length === 0) return `Nothing in ${project.name}'s videos or documents matches "${words}". Try fewer words, or other words for the same thing.`;
	const lines = matches.map((match) => `- ${describeMatch(match)}`);
	const opening = `Open a video with ${openingAction.video}, or a document with ${openingAction.document}.`;
	return [`# What matches "${words}" in ${project.name}'s videos and documents, best first:`, ...lines, '', opening].join('\n');
}

function describeMatch(match: LibraryMatch): string {
	const idWords = match.kind === libraryMatchKinds.video ? 'video id' : 'document id';
	const place = match.library === null ? match.section : `${match.section}, ${match.library} library`;
	const excerpt = excerptAsMarkdown(match.excerpt);
	const heading = `${libraryMatchKindWords[match.kind]}: ${match.title} (${place}, ${idWords}: ${match.id}), at ${companyDetails.websiteUrl}${libraryMatchHref(match)}`;
	if (excerpt === '') return heading;
	return `${heading}\n  ${excerpt}`;
}
