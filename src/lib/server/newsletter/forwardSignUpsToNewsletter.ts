import type { SupabaseClient } from '@supabase/supabase-js';
import {
	beehiivPublication,
	beehiivSubscriptionRequest,
	type BeehiivPublication
} from './beehiivSubscription';
import { markSignUpForwarded, findWaitingSignUps } from './newsletterSignUps';

/**
 * Hands every sign-up beehiiv has not taken yet to the publication, so the ones
 * kept before the key was set, or while beehiiv refused, go with the next one.
 */
export async function forwardSignUpsToNewsletter(supabase: SupabaseClient): Promise<void> {
	const publication = beehiivPublication();
	if (publication === null) return;
	const waitingEmails = await findWaitingSignUps(supabase);
	for (const email of waitingEmails) {
		await forwardSignUp(supabase, publication, email);
	}
}

async function forwardSignUp(
	supabase: SupabaseClient,
	publication: BeehiivPublication,
	email: string
): Promise<void> {
	const response = await fetch(beehiivSubscriptionRequest(publication, email));
	if (!response.ok) throw new Error(`beehiiv refused a sign-up with status ${response.status}`);
	await markSignUpForwarded(supabase, email);
}
