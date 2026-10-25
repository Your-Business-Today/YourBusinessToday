import { parseTaskAutocomplete, type AutocompleteSetting } from '$lib/data/autocomplete';
import { parseTaskComplexity, type TaskComplexity } from '$lib/data/taskComplexity';

/** What a task carries for the AIs that size, build and merge it, and where its merged work stands. */
export type TaskBuildFields = {
	complexity: TaskComplexity | null;
	branchName: string;
	pullRequestUrl: string;
	autocompleteSetting: AutocompleteSetting;
	isBuildable: boolean;
	modelNeeded: string | null;
	stagedAt: string | null;
	liveAt: string | null;
};

export function parseTaskBuildFields(row: Record<string, unknown>): TaskBuildFields {
	return {
		complexity: parseTaskComplexity(row),
		branchName: (row.branch_name as string) ?? '',
		pullRequestUrl: (row.pull_request_url as string) ?? '',
		autocompleteSetting: parseTaskAutocomplete(row.is_autocomplete),
		isBuildable: row.is_buildable === true,
		modelNeeded: (row.model_needed as string) ?? null,
		stagedAt: (row.staged_at as string) ?? null,
		liveAt: (row.live_at as string) ?? null
	};
}
