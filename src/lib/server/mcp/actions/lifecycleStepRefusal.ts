import type { SupabaseClient } from '@supabase/supabase-js';
import { claimLeaseMinutes, claimPhrase, isHeldByAnother, isHoldingStep, standingClaim } from '$lib/data/lifecycleClaim';
import type { Claim } from '$lib/data/lifecycleClaim';
import { lifecycleSteps } from '$lib/data/lifecycleStep';
import { getLifecycleSteps } from '$lib/server/lifecycle/getLifecycleSteps';
import { goalConsideredRefusal } from './goalConsideredRefusal';
import { isGoalSubject } from '$lib/server/conversations/conversationSubject';
import type { LifecycleStepInput } from '$lib/data/validateLifecycleStep';
import type { ResolvedSubject } from './resolveSubject';

/** Why this step cannot be recorded now, or null when it can. */
export async function lifecycleStepRefusal(
	supabase: SupabaseClient,
	resolved: ResolvedSubject,
	step: LifecycleStepInput
): Promise<string | null> {
	if (isHoldingStep(step.step)) return claimRefusal(supabase, resolved, step.agent);
	const { subject } = resolved;
	const isGoalConsidered = step.step === lifecycleSteps.considered && isGoalSubject(subject);
	if (!isGoalConsidered) return null;
	return goalConsideredRefusal(supabase, resolved, step.agent);
}

async function claimRefusal(
	supabase: SupabaseClient,
	resolved: ResolvedSubject,
	agent: string
): Promise<string | null> {
	const now = new Date();
	const claim = standingClaim(await getLifecycleSteps(supabase, resolved.subject), now);
	if (isHeldByAnother(claim, agent)) return heldRefusal(`"${resolved.title}"`, claim);
	if (resolved.parentGoalId === null) return null;
	const goalSteps = await getLifecycleSteps(supabase, { goalId: resolved.parentGoalId });
	const goalClaim = standingClaim(goalSteps, now);
	if (isHeldByAnother(goalClaim, agent)) return heldRefusal('Its goal', goalClaim);
	return null;
}

function heldRefusal(what: string, claim: Claim): string {
	return (
		`${what} is ${claimPhrase(claim)}. Leave it to them: the claim runs out ${claimLeaseMinutes} ` +
		'minutes after their last step, or as soon as they record a step that lets it go.'
	);
}
