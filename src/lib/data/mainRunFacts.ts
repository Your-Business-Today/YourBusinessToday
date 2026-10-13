import { mainRunOutcomes, type MainRun } from './mainRun';

export type MainRunFact = { label: string; href?: string };

export const noMainRunsYet = 'No runs on main read yet';

const outcomeMarks = { [mainRunOutcomes.passed]: '✓', [mainRunOutcomes.failed]: '✗' } as const;

/** One fact per check on the default branch, linking to its run; a single fact when none has been read yet. */
export function mainRunFacts(runs: MainRun[]): MainRunFact[] {
	if (runs.length === 0) return [{ label: noMainRunsYet }];
	return runs.map(factOf);
}

function factOf(run: MainRun): MainRunFact {
	const label = `${outcomeMarks[run.outcome]} ${run.checkName} ${run.outcome}`;
	if (run.runUrl === '') return { label };
	return { label, href: run.runUrl };
}
