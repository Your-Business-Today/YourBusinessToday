export const mainRunOutcomes = { passed: 'passed', failed: 'failed' } as const;

export type MainRunOutcome = (typeof mainRunOutcomes)[keyof typeof mainRunOutcomes];

/** The last finished run of one check on a project's default branch: a workflow, or the production deploy. */
export type MainRun = { checkName: string; outcome: MainRunOutcome; runUrl: string; finishedAt: string };

/**
 * What GitHub says finished: a workflow run on a branch, or a production deployment, which has no branch.
 * The commit is the one it ran on, or '' when GitHub did not say.
 */
export type FinishedRun = MainRun & {
	repositoryUrl: string;
	branch: string;
	isProductionDeploy: boolean;
	runId: string;
	commitSha: string;
};

/** Passed or failed, or null for an ending that is neither, such as a cancelled or skipped run. */
export function outcomeOf(
	ending: string,
	passingEndings: ReadonlySet<string>,
	failingEndings: ReadonlySet<string>
): MainRunOutcome | null {
	if (passingEndings.has(ending)) return mainRunOutcomes.passed;
	if (failingEndings.has(ending)) return mainRunOutcomes.failed;
	return null;
}
