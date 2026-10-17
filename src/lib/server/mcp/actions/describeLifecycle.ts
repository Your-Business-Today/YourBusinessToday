import { claimLeaseMinutes, claimPhrase, standingClaim, type Claim } from '$lib/data/lifecycleClaim';
import { lifecycleOutcomeLabels, lifecycleStepLabels } from '$lib/data/lifecycleStep';
import type { LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';
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
	const claim = standingClaim(steps, new Date());
	return [
		'Lifecycle, oldest first:',
		...steps.map((step) => `- ${lifecycleStepPhrase(step)}`),
		claimLine(claim)
	];
}

export function lifecycleMarkSuffix(mark: LifecycleMark | undefined): string {
	if (mark === undefined) return '';
	const held = mark.claim === null ? '' : `; ${heldWarning(mark.claim)}`;
	return `; lifecycle: ${lifecycleStepPhrase(mark.latest)}${held}`;
}

function claimLine(claim: Claim | null): string {
	if (claim === null) return 'Claim: nobody holds it, so any AI may claim it by recording considering.';
	return `Claim: ${heldWarning(claim)}; the claim runs out ${claimLeaseMinutes} minutes after their last step.`;
}

function heldWarning(claim: Claim): string {
	return `${claimPhrase(claim)} — leave it unless you are ${claim.agent}`;
}
