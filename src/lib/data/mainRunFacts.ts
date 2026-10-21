import { mainRunOutcomes, type MainRun } from './mainRun';

export type MainRunFact = { label: string; href?: string };

const failedMark = '✗';

const onDefaultBranch = '';

/**
 * One fact per check failing on the default branch, or on the branch named, linking to its run; nothing while
 * every check passes.
 */
export function mainRunFacts(runs: MainRun[], branch: string = onDefaultBranch): MainRunFact[] {
	return runs.filter(isFailing).map((run) => factOf(run, branch));
}

function isFailing(run: MainRun): boolean {
	return run.outcome === mainRunOutcomes.failed;
}

function factOf(run: MainRun, branch: string): MainRunFact {
	const place = branch === onDefaultBranch ? '' : ` on ${branch}`;
	const label = `${failedMark} ${run.checkName} failed${place}`;
	if (run.runUrl === '') return { label };
	return { label, href: run.runUrl };
}
