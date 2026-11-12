import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stripePaymentActions } from './stripePaymentActions';
import type { McpCaller } from '../resolveMcpCaller';

const administrator = { accountId: 'admin-1', isAdmin: true, supabase: {} } as unknown as McpCaller;

const { books, eventMarked } = vi.hoisted(() => ({ books: { events: [] as unknown[] }, eventMarked: vi.fn() }));

vi.mock('$lib/server/billing/stripeEventsToCheck', () => ({
	findStripeEventsToCheck: async () => books.events,
	markStripeEventDealtWith: eventMarked
}));

const stray = {
	id: '11111111-1111-4111-8111-111111111111',
	stripeEventId: 'evt_stray',
	eventType: 'checkout.session.completed',
	paymentIntentId: 'pi_1',
	receivedAt: '2026-11-20T10:00:00Z',
	amountPence: 5000,
	currency: 'gbp',
	payerEmail: 'accounts@jewel.example',
	outcome: 'unmatched',
	reason: 'Checkout cs_1 names no invoice.'
};

function run(name: string, input: Record<string, unknown>) {
	const action = stripePaymentActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(administrator, input);
}

describe('the Stripe events to check, through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		books.events = [stray];
		eventMarked.mockResolvedValue(true);
	});

	it('marks an event dealt with by its Stripe id, under the administrator', async () => {
		expect(await run('mark_stripe_payment_dealt_with', { stripeEventId: 'evt_stray' })).toBe('evt_stray is marked dealt with; 0 left to check.');
		expect(eventMarked).toHaveBeenCalledWith(administrator.supabase, stray.id, 'admin-1');
	});

	it('marks nothing that is not waiting, is already dealt with, or is not a Stripe event id', async () => {
		expect(await run('mark_stripe_payment_dealt_with', { stripeEventId: 'evt_other' })).toContain('No Stripe event waiting to be checked has that id');
		expect(await run('mark_stripe_payment_dealt_with', { stripeEventId: 'cs_1' })).toContain('Stripe event id');
		expect(eventMarked).not.toHaveBeenCalled();
		eventMarked.mockResolvedValue(false);
		expect(await run('mark_stripe_payment_dealt_with', { stripeEventId: 'evt_stray' })).toBe('That Stripe event was already dealt with.');
	});

	it('lists the events to check as before', async () => {
		expect(await run('read_stripe_payments_to_check', {})).toContain('evt_stray');
	});
});
