import { lifecycleStepLabels, type LifecycleStepName } from './lifecycleStep';
import type { Claim } from './lifecycleClaim';

/** What a backlog card says of a task's lifecycle: who holds it now, or its latest step. */
export type LifecycleBadge = { step: LifecycleStepName; agent: string; isHeld: boolean };

export type BadgeSource = { latest: { step: LifecycleStepName; agent: string }; claim: Claim | null };

export function badgeOf(source: BadgeSource): LifecycleBadge {
	const { latest, claim } = source;
	if (claim !== null) return { step: claim.step, agent: claim.agent, isHeld: true };
	return { step: latest.step, agent: latest.agent, isHeld: false };
}

/** "Building, Qwen on the Mac mini" */
export function badgeText(badge: LifecycleBadge): string {
	return `${lifecycleStepLabels[badge.step]}, ${badge.agent}`;
}
