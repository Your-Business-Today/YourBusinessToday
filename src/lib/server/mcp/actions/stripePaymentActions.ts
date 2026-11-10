import { findStripeEventsToCheck } from '$lib/server/billing/stripeEventsToCheck';
import { describeStripeEventsToCheck } from './describeStripeEventsToCheck';
import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';

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
			'refunds it by hand, then marks it dealt with on the admin page Stripe payments to check.',
		inputSchema: objectSchema({}),
		run: async (caller) => describeStripeEventsToCheck(await findStripeEventsToCheck(caller.supabase))
	}
];
