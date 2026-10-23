import { lifecycleSteps, type LifecycleStepName } from './lifecycleStep';

const stepsThatStartTheWork: readonly LifecycleStepName[] = [
	lifecycleSteps.building,
	lifecycleSteps.built,
	lifecycleSteps.reviewing,
	lifecycleSteps.pullRequestOpen
];

/** Considering only looks at a task, which may still wait on a person; these steps mean the work is under way. */
export function startsTheWork(step: LifecycleStepName): boolean {
	return stepsThatStartTheWork.includes(step);
}
