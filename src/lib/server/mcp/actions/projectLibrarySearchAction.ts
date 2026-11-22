import { describeLibraryMatches, librarySearchNotReadyYet } from './describeLibraryMatches';
import { LibrarySearchLimits } from '$lib/projectLibrary/libraryMatch';
import { checkSearchWords } from '$lib/projectLibrary/validateSearchWords';
import { noReachableProject, reachableProject } from '../projectAccess';
import { objectSchema, readText, textField, type McpAction } from '../actionTypes';
import { searchProjectLibrary } from '$lib/server/projectLibrary/searchProjectLibrary';
import type { McpCaller } from '../resolveMcpCaller';

const { longestWords, mostMatches } = LibrarySearchLimits;

const searchProjectLibrarySchema = objectSchema(
	{
		projectId: textField('The project id, as list_projects gives it'),
		words: textField(`What to look for, such as upload a report, at most ${longestWords} characters; quote a phrase, and put - before a word to leave it out`)
	},
	['projectId', 'words']
);

/** The project's videos and documents that match the words, best first, as its Videos and Documents pages search them. */
async function searchLibrary(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const words = checkSearchWords(input.words);
	if ('refusal' in words) return `Not searched: ${words.refusal}.`;
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const matches = await searchProjectLibrary(caller.supabase, project.id, words.value);
	if (matches === null) return librarySearchNotReadyYet;
	return describeLibraryMatches(project, words.value, matches);
}

/** The connector's door to searching a project's videos and documents by keyword. */
export const searchProjectLibraryAction: McpAction = {
	name: 'search_project_library',
	area: 'projects',
	audience: 'everyone',
	isWrite: false,
	summary: 'search a project’s videos and documents by keyword, best match first, with the words around each match',
	guidance:
		`Use this when someone asks how to do something on what was built, before listing everything. It looks in titles, descriptions, ` +
		`sections and the full text of written documents, and gives back at most ${mostMatches}; a document sent as a file is found by its title, summary and section.`,
	inputSchema: searchProjectLibrarySchema,
	run: searchLibrary
};
