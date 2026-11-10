import type { CheckoutGateway, CheckoutOrder, CheckoutSession, CheckoutSessionStatus } from './checkoutGateway';
import type { InvoiceCheckoutSessions } from './invoiceCheckoutSessions';

/** Stripe as a test-mode stand-in: the sessions it holds, the orders it was given and the sessions it expired. */
export function stripeStandIn(sessions: CheckoutSession[] = []) {
	const orders: CheckoutOrder[] = [];
	const expired: string[] = [];
	const gateway: CheckoutGateway = {
		findSession: async (sessionId) => sessions.find((session) => session.id === sessionId) ?? null,
		openSession: async (order) => {
			orders.push(order);
			const session = { id: `cs_test_${orders.length}`, url: `https://checkout.stripe.example/${orders.length}`, status: 'open' as const, amountPence: order.amountPence };
			sessions.push(session);
			return session;
		},
		expireSession: async (sessionId) => {
			expired.push(sessionId);
		}
	};
	return { gateway, orders, expired };
}

export function booksHolding(heldSessionId: string | null, isRaceLost = false) {
	const kept: string[] = [];
	const books: InvoiceCheckoutSessions = {
		findHeld: async () => heldSessionId,
		replaceHeld: async (_place, _held, newSessionId) => {
			if (isRaceLost) return false;
			kept.push(newSessionId);
			return true;
		}
	};
	return { books, kept };
}

export function heldSession(status: CheckoutSessionStatus, amountPence: number): CheckoutSession {
	return { id: 'cs_test_held', url: 'https://checkout.stripe.example/held', status, amountPence };
}
