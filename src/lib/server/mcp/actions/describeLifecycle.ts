import { lifecycleOutcomeLabels, lifecycleStepLabels } from '$lib/data/lifecycleStep';
import type { LifecycleStep } from '$lib/server/lifecycle/lifecycleStepRecord';

/** "Building by Claude cloud session (claude-opus-5-5), 17 Oct 2026 08:10: note" */
export function lifecycleStepPhrase(step: LifecycleStep): string {
	const outcome = lifecycleOutcomeLabels[step.outcome];
	const label = outcome === '' ? lifecycleStepLabels[step.step] : `${lifecycleStepLabels[step.step]}, ${outcome}`;
	const model = step.model === '' ? '' : ` (${step.model})`;
	const branch = step.branchName === '' ? '' : ` on ${step.branchName}`;
	const note = step.note === '' ? '' : `: ${step.note}`;
	return `${label} by ${step.agent}${model}${branch}, ${step.createdAt}${note}`;
}

export function lifecycleLines(steps: LifecycleStep[]): string[] {
	if (steps.length === 0) return ['Lifecycle: no AI has taken a step on it yet.'];
	return ['Lifecycle, oldest first:', ...steps.map((step) => `- ${lifecycleStepPhrase(step)}`)];
}

export function latestStepSuffix(step: LifecycleStep | undefined): string {
	if (step === undefined) return '';
	return `; lifecycle: ${lifecycleStepPhrase(step)}`;
}
