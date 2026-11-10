import type { SupabaseClient } from '@supabase/supabase-js';
import { StripeEventOutcomes, type StripeEventOutcome } from '$lib/data/billing/stripeEventRules';
import { minutesBeforeUnfinished, type StripeEventToCheck } from '$lib/data/billing/stripeEventToCheck';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { stripeEventsTable } from './stripeEventRows';

type StripeEventToCheckRow = {
	id: string;
	stripe_event_id: string;
	event_type: string;
	stripe_payment_intent_id: string | null;
	received_at: string;
	amount_pence: number | string;
	currency: string;
	payer_email: string;
	outcome: StripeEventOutcome;
	reason: string;
};

const columns = 'id, stripe_event_id, event_type, stripe_payment_intent_id, received_at, amount_pence, currency, payer_email, outcome, reason';
const millisecondsInMinute = 60_000;
const nothing = 0;

/**
 * Every Stripe event nobody has dealt with that the books could not finish by themselves, newest first: money that
 * matches no invoice, posting stopped on an error, and posting that never finished. None until migration 0182 has run.
 */
export async function findStripeEventsToCheck(service: SupabaseClient, now: Date = new Date()): Promise<StripeEventToCheck[]> {
	const unfinishedBefore = new Date(now.getTime() - minutesBeforeUnfinished * millisecondsInMinute).toISOString();
	const { unmatched, failed, received } = StripeEventOutcomes;
	const { data, error } = await service
		.from(stripeEventsTable)
		.select(columns)
		.is('dealt_with_at', null)
		.or(`outcome.in.(${unmatched},${failed}),and(outcome.eq.${received},received_at.lt."${unfinishedBefore}")`)
		.order('received_at', { ascending: false });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return (data as StripeEventToCheckRow[]).map(fromRow);
}

/** Marks the event dealt with by the administrator, so it leaves the list; says whether it was still to deal with. */
export async function markStripeEventDealtWith(service: SupabaseClient, rowId: string, administratorId: string): Promise<boolean> {
	const { data, error } = await service
		.from(stripeEventsTable)
		.update({ dealt_with_at: new Date().toISOString(), dealt_with_by: administratorId })
		.eq('id', rowId)
		.is('dealt_with_at', null)
		.select('id');
	if (error !== null) throw error;
	return (data ?? []).length > nothing;
}

function fromRow(row: StripeEventToCheckRow): StripeEventToCheck {
	return {
		id: row.id,
		stripeEventId: row.stripe_event_id,
		eventType: row.event_type,
		paymentIntentId: row.stripe_payment_intent_id,
		receivedAt: row.received_at,
		amountPence: Number(row.amount_pence),
		currency: row.currency,
		payerEmail: row.payer_email,
		outcome: row.outcome,
		reason: row.reason
	};
}
