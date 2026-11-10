import { ukClockAt } from '$lib/data/ukClock';
import { StripeEventTypes, type StripeEventType } from './stripeEventRules';
import { readCheckoutPayment, type CheckoutPayment } from './stripeCheckoutPayment';
import { readChargeRefund, type ChargeRefund } from './stripeChargeRefund';

/** A Stripe event as its webhook delivers it, verified: its id, type, when it happened, and the object it is about. */
export type StripeEventDelivery = { id: string; type: string; created: number; data: { object: unknown } };

/** What every event the books act on carries: its id and type, its payment, and the UK day it happened on. */
type NoticeHeading = { eventId: string; eventType: StripeEventType; paymentIntentId: string | null; happenedOn: string };

/** What a notice tells the books of: money paid, or money refunded. */
export const StripeNoticeKinds = { payment: 'payment', refund: 'refund' } as const;

/** Money a client paid through a Checkout page, for the invoice the page names. */
export type StripePaymentNotice = NoticeHeading & { kind: typeof StripeNoticeKinds.payment } & CheckoutPayment;

/** Money handed back on a charge: everything refunded on it so far, in pence. */
export type StripeRefundNotice = NoticeHeading & { kind: typeof StripeNoticeKinds.refund } & ChargeRefund;

export type StripeNotice = StripePaymentNotice | StripeRefundNotice;

const millisecondsInSecond = 1000;
const paymentEventTypes: string[] = [StripeEventTypes.checkoutCompleted, StripeEventTypes.checkoutPaidLater];

/** What the event tells the books, or null when it tells them nothing: another kind of event, or a page not yet paid. */
export function readStripeNotice(event: StripeEventDelivery): StripeNotice | null {
	const { id, type, created, data } = event;
	const happenedOn = ukClockAt(new Date(created * millisecondsInSecond)).date;
	const heading = { eventId: id, eventType: type as StripeEventType, happenedOn };
	if (paymentEventTypes.includes(type)) return paymentNotice(heading, data.object);
	if (type === StripeEventTypes.chargeRefunded) return refundNotice(heading, data.object);
	return null;
}

function paymentNotice(heading: Omit<NoticeHeading, 'paymentIntentId'>, session: unknown): StripePaymentNotice | null {
	const payment = readCheckoutPayment(session);
	if (payment === null) return null;
	return { ...heading, kind: StripeNoticeKinds.payment, ...payment };
}

function refundNotice(heading: Omit<NoticeHeading, 'paymentIntentId'>, charge: unknown): StripeRefundNotice {
	return { ...heading, kind: StripeNoticeKinds.refund, ...readChargeRefund(charge) };
}
