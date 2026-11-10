import Stripe from 'stripe';
import { companyDetails } from '$lib/data/companyDetails';
import { stripeSecretKey } from './stripeSecretKey';
import { checkoutMetadataOf } from '$lib/data/billing/checkoutMetadata';
import { CheckoutSessionStatuses, type CheckoutGateway, type CheckoutOrder, type CheckoutSession } from './checkoutGateway';

type StripeCheckoutSessions = Stripe['checkout']['sessions'];

type StripeCheckoutSession = Awaited<ReturnType<StripeCheckoutSessions['retrieve']>>;

const { StripeError } = Stripe.errors;
const poundSterling = 'gbp';
const onePayment = 'payment';
const missingResource = 'resource_missing';

/** Stripe's Checkout, or null until its secret key is set, so the Billing section says paying is not open. */
export function stripeCheckoutGateway(): CheckoutGateway | null {
	const secretKey = stripeSecretKey();
	if (secretKey === null) return null;
	const { checkout } = new Stripe(secretKey);
	const sessions = checkout.sessions;
	return {
		findSession: (sessionId) => findSession(sessions, sessionId),
		openSession: (order) => openSession(sessions, order),
		expireSession: async (sessionId) => {
			await sessions.expire(sessionId);
		}
	};
}

async function findSession(sessions: StripeCheckoutSessions, sessionId: string): Promise<CheckoutSession | null> {
	try {
		return toCheckoutSession(await sessions.retrieve(sessionId));
	} catch (error) {
		if (isMissing(error)) return null;
		throw error;
	}
}

async function openSession(sessions: StripeCheckoutSessions, order: CheckoutOrder): Promise<CheckoutSession> {
	const metadata = checkoutMetadataOf(order);
	const description = `Invoice ${order.printedNumber} from ${companyDetails.tradingName}`;
	const session = await sessions.create({
		mode: onePayment,
		client_reference_id: order.invoiceId,
		customer_email: order.payerEmail,
		line_items: [{ quantity: 1, price_data: { currency: poundSterling, unit_amount: order.amountPence, product_data: { name: description } } }],
		metadata,
		payment_intent_data: { description, metadata },
		success_url: order.paidUrl,
		cancel_url: order.cancelledUrl
	});
	return toCheckoutSession(session);
}

function toCheckoutSession(session: StripeCheckoutSession): CheckoutSession {
	const { id, url, status, amount_total: amountTotal } = session;
	return { id, url, status: status ?? CheckoutSessionStatuses.expired, amountPence: amountTotal ?? 0 };
}

function isMissing(error: unknown): boolean {
	return error instanceof StripeError && error.code === missingResource;
}
