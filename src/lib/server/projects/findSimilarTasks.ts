import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { matchingAnyOf } from '$lib/server/search/wordMatch';
import { mostSimilar, wordsToSearch } from '$lib/server/search/similarTexts';
import { comparedTaskTexts, type SimilarTask } from '$lib/data/similarTasks';

export type { SimilarTask };

type Candidate = {
	id: string;
	projectId: string;
	title: string;
	storyWant: string;
	raisedById: string;
};

const mostCandidatesRead = 300;
const searchedColumns = ['title', 'story_want'];

/** Open tasks on the project that say the same as, or look like, any of the texts, with who raised each. */
export async function findSimilarTasks(supabase: SupabaseClient, projectId: string, texts: string[]): Promise<SimilarTask[]> {
	const words = wordsToSearch(texts);
	if (words.length === 0) return [];
	const candidates = await readCandidates(supabase, projectId, words);
	const found = mostSimilar(texts, candidates, (candidate) => comparedTaskTexts(candidate.title, candidate.storyWant));
	const raiserIds = found.map(({ item }) => item.raisedById);
	const raisers = await getAccountsById(supabase, raiserIds);
	const nameById = new Map(raisers.map((account) => [account.id, account.name]));
	return found.map(({ item, shared }) => ({
		taskId: item.id,
		projectId: item.projectId,
		title: item.title,
		raisedBy: nameById.get(item.raisedById) ?? 'someone',
		sharedWords: shared
	}));
}

async function readCandidates(supabase: SupabaseClient, projectId: string, words: string[]): Promise<Candidate[]> {
	const anyWord = words.map((word) => matchingAnyOf(searchedColumns, word)).join(',');
	const { data, error } = await supabase
		.from('tasks')
		.select('id, project_id, title, story_want, created_by, requested_by')
		.eq('project_id', projectId)
		.neq('status', doneTaskStatus)
		.or(anyWord)
		.limit(mostCandidatesRead);
	if (error) throw error;
	return (data ?? []).map(parseCandidate);
}

function parseCandidate(row: Record<string, unknown>): Candidate {
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		title: String(row.title ?? ''),
		storyWant: String(row.story_want ?? ''),
		raisedById: String(row.requested_by ?? row.created_by ?? '')
	};
}
