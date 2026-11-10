import type { SupabaseClient } from '@supabase/supabase-js';
import { StripeEventOutcomes } from '$lib/data/billing/stripeEventRules';
import { stripeEventsTable, toClaimRow } from './stripeEventRows';
import type { StripeEventClaim } from './stripeEventBook';

const uniqueViolation = '23505';

/**
 * Keeps the event and answers its row. An event already held answers null, so it is acted on once, unless it failed
 * before: then it is claimed again, by one delivery alone. A refund while another refund on the same payment is still
 * being posted is refused by the database, so Stripe sends it again once that one is posted.
 */
export async function claimStripeEvent(service: SupabaseClient, claim: StripeEventClaim): Promise<string | null> {
	const { data, error } = await service.from(stripeEventsTable).insert(toClaimRow(claim)).select('id').single();
	const claimed = data as { id: string } | null;
	if (error === null) return claimed?.id ?? null;
	if (error.code !== uniqueViolation) throw error;
	const isHeld = await isEventHeld(service, claim.eventId);
	if (!isHeld) throw error;
	return claimFailedAgain(service, claim.eventId);
}

async function isEventHeld(service: SupabaseClient, eventId: string): Promise<boolean> {
	const { data, error } = await service.from(stripeEventsTable).select('id').eq('stripe_event_id', eventId).maybeSingle();
	if (error !== null) throw error;
	return data !== null;
}

async function claimFailedAgain(service: SupabaseClient, eventId: string): Promise<string | null> {
	const { data, error } = await service
		.from(stripeEventsTable)
		.update({ outcome: StripeEventOutcomes.received, reason: '', settled_at: null })
		.eq('stripe_event_id', eventId)
		.eq('outcome', StripeEventOutcomes.failed)
		.select('id');
	if (error !== null) throw error;
	const [reclaimed] = (data ?? []) as { id: string }[];
	return reclaimed?.id ?? null;
}
