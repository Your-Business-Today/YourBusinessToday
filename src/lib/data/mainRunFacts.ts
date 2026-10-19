import { mainRunOutcomes, type MainRun } from './mainRun';

export type MainRunFact = { label: string; href?: string };

const failedMark = '✗';

/** One fact per check failing on the default branch, linking to its run; nothing while every check passes. */
export function mainRunFacts(runs: MainRun[]): MainRunFact[] {
	return runs.filter(isFailing).map(factOf);
}

function isFailing(run: MainRun): boolean {
	return run.outcome === mainRunOutcomes.failed;
}

function factOf(run: MainRun): MainRunFact {
	const label = `${failedMark} ${run.checkName} failed`;
	if (run.runUrl === '') return { label };
	return { label, href: run.runUrl };
}
