import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { matchingAnyOf } from '$lib/server/search/wordMatch';
import { meaningfulWords, mostSimilar } from '$lib/server/search/similarWords';
import type { SimilarTask } from '$lib/data/similarTasks';

export type { SimilarTask };

type Candidate = {
	id: string;
	projectId: string;
	title: string;
	storyWant: string;
	projectName: string;
	raisedById: string;
};

const mostCandidatesRead = 300;
const searchedColumns = ['title', 'story_want'];

/** Open tasks on these projects that share enough meaningful words with the new task's text, with who raised each. */
export async function findSimilarTasks(
	supabase: SupabaseClient,
	projectIds: string[],
	text: string
): Promise<SimilarTask[]> {
	const words = meaningfulWords(text);
	if (projectIds.length === 0 || words.length === 0) return [];
	const candidates = await readCandidates(supabase, projectIds, words);
	const found = mostSimilar(text, candidates, (candidate) => `${candidate.title} ${candidate.storyWant}`);
	const raiserIds = found.map(({ item }) => item.raisedById);
	const raisers = await getAccountsById(supabase, raiserIds);
	const nameById = new Map(raisers.map((account) => [account.id, account.name]));
	return found.map(({ item, shared }) => ({
		taskId: item.id,
		projectId: item.projectId,
		title: item.title,
		projectName: item.projectName,
		raisedById: item.raisedById,
		raisedBy: nameById.get(item.raisedById) ?? 'someone',
		sharedWords: shared
	}));
}

async function readCandidates(supabase: SupabaseClient, projectIds: string[], words: string[]): Promise<Candidate[]> {
	const anyWord = words.map((word) => matchingAnyOf(searchedColumns, word)).join(',');
	const { data, error } = await supabase
		.from('tasks')
		.select('id, project_id, title, story_want, created_by, requested_by, projects(name)')
		.in('project_id', projectIds)
		.neq('status', doneTaskStatus)
		.or(anyWord)
		.limit(mostCandidatesRead);
	if (error) throw error;
	return (data ?? []).map(parseCandidate);
}

function parseCandidate(row: Record<string, unknown>): Candidate {
	const project = (row.projects ?? {}) as { name?: unknown };
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		title: String(row.title ?? ''),
		storyWant: String(row.story_want ?? ''),
		projectName: String(project.name ?? ''),
		raisedById: String(row.requested_by ?? row.created_by ?? '')
	};
}
