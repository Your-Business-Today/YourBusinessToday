import { lifecycleStepLabels, lifecycleSteps, type LifecycleStepName } from './lifecycleStep';

export type ClaimingStep = { step: LifecycleStepName; agent: string; createdAt: string };

export type Claim = { agent: string; step: LifecycleStepName; since: string };

export const claimLeaseMinutes = 120;

const millisecondsPerMinute = 60_000;

const holdingSteps: readonly LifecycleStepName[] = [
	lifecycleSteps.considering,
	lifecycleSteps.building,
	lifecycleSteps.reviewing
];

/** Considering, building and reviewing claim the work; every other step lets it go. */
export function isHoldingStep(step: LifecycleStepName): boolean {
	return holdingSteps.includes(step);
}

/**
 * The claim the steps (oldest first) leave standing now, or null when nothing holds the work.
 * A claim ends when its lease runs out, when its holder records any step that does not hold,
 * or when the work merges.
 */
export function standingClaim(steps: ClaimingStep[], now: Date): Claim | null {
	const claimIndex = steps.findLastIndex((candidate) => isHoldingStep(candidate.step));
	if (claimIndex === -1) return null;
	const claimStep = steps[claimIndex];
	if (isLeaseOver(claimStep, now)) return null;
	const laterSteps = steps.slice(claimIndex + 1);
	const isEnded = laterSteps.some((later) => endsClaim(later, claimStep.agent));
	if (isEnded) return null;
	return { agent: claimStep.agent, step: claimStep.step, since: claimStep.createdAt };
}

export function isHeldByAnother(claim: Claim | null, agent: string): claim is Claim {
	if (claim === null) return false;
	return claim.agent !== agent;
}

export function claimPhrase(claim: Claim): string {
	const doing = lifecycleStepLabels[claim.step].toLowerCase();
	return `held by ${claim.agent} (${doing}) since ${claim.since}`;
}

function isLeaseOver(step: ClaimingStep, now: Date): boolean {
	const leaseEnds = Date.parse(step.createdAt) + claimLeaseMinutes * millisecondsPerMinute;
	return now.getTime() > leaseEnds;
}

function endsClaim(later: ClaimingStep, holder: string): boolean {
	const isMerged = later.step === lifecycleSteps.merged;
	return later.agent === holder || isMerged;
}
