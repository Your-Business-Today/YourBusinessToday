import { describeStripeEventsToCheck } from './describeStripeEventsToCheck';
import { findStripeEventsToCheck, markStripeEventDealtWith } from '$lib/server/billing/stripeEventsToCheck';
import { objectSchema, readText, textField } from '../actionTypes';
import { validateStripeEventId } from '$lib/data/billing/stripeEventRules';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const notWaitingToBeChecked = 'No Stripe event waiting to be checked has that id. Call read_stripe_payments_to_check to see them.';
const alreadyDealtWith = 'That Stripe event was already dealt with.';

export const stripePaymentActions: McpAction[] = [
	{
		name: 'read_stripe_payments_to_check',
		area: 'support',
		audience: 'admin',
		isWrite: false,
		summary:
			'the Stripe payments and refunds the books could not post by themselves: money that matches no invoice, ' +
			'one the books refused, and posting that stopped or never finished',
		guidance:
			'Read it when the person asks whether every Stripe payment reached the books. Each payment a client makes from ' +
			'the Billing section is posted by itself; one listed here was not, and the reason says why. The person posts or ' +
			'refunds it by hand, then marks it dealt with — mark_stripe_payment_dealt_with, or the admin page Stripe payments to check.',
		inputSchema: objectSchema({}),
		run: async (caller) => describeStripeEventsToCheck(await findStripeEventsToCheck(caller.supabase))
	},
	{
		name: 'mark_stripe_payment_dealt_with',
		area: 'support',
		audience: 'admin',
		isWrite: true,
		summary: 'mark a Stripe event dealt with once its payment or refund is posted or refunded by hand, so it leaves the list to check',
		guidance:
			'Mark an event only when the person says the money is posted or refunded by hand; marking it posts nothing and ' +
			'only takes it off the list. Say what is left to check afterwards, as the answer does.',
		inputSchema: objectSchema({ stripeEventId: textField('The Stripe event id, such as evt_…, as read_stripe_payments_to_check gives it') }, ['stripeEventId']),
		run: async (caller, input) => markDealtWith(caller, readText(input, 'stripeEventId'))
	}
];

async function markDealtWith(caller: McpCaller, stripeEventId: string): Promise<string> {
	const idRefusal = validateStripeEventId(stripeEventId);
	if (idRefusal !== null) return idRefusal;
	const events = await findStripeEventsToCheck(caller.supabase);
	const event = events.find((candidate) => candidate.stripeEventId === stripeEventId);
	if (event === undefined) return notWaitingToBeChecked;
	const isMarked = await markStripeEventDealtWith(caller.supabase, event.id, caller.accountId);
	if (!isMarked) return alreadyDealtWith;
	return `${stripeEventId} is marked dealt with; ${events.length - 1} left to check.`;
}
