import type { DemoEmail, DemoInvoice, DemoInvoiceStatusValue, DemoQuote, DemoQuoteStatusValue } from '../demoBusiness';
import { isoDateDaysFrom } from '../demoDates';

const paymentTermsDays = 30;

/** Builds a seed quote dated so many days before the day the copy starts. */
export function quoteSentBefore(today: string) {
	return (
		id: string,
		clientId: string,
		work: string,
		amount: number,
		sentDaysAgo: number,
		status: DemoQuoteStatusValue,
		chasedDaysAgo: number | null
	): DemoQuote => ({
		id,
		clientId,
		work,
		amount,
		sentOn: isoDateDaysFrom(today, -sentDaysAgo),
		status,
		chasedOn: chasedDaysAgo === null ? null : isoDateDaysFrom(today, -chasedDaysAgo)
	});
}

/** Builds a seed invoice on 30-day terms, issued so many days before the day the copy starts. */
export function invoiceIssuedBefore(today: string) {
	return (
		id: string,
		clientId: string,
		jobId: string,
		amount: number,
		issuedDaysAgo: number,
		status: DemoInvoiceStatusValue
	): DemoInvoice => ({
		id,
		clientId,
		jobId,
		amount,
		issuedOn: isoDateDaysFrom(today, -issuedDaysAgo),
		dueOn: isoDateDaysFrom(today, paymentTermsDays - issuedDaysAgo),
		status,
		chasedOn: null
	});
}

/** Builds a seed email received so many days before the day the copy starts. */
export function emailReceivedBefore(today: string) {
	return (id: string, from: string, subject: string, receivedDaysAgo: number, summary: string): DemoEmail => ({
		id,
		from,
		subject,
		receivedOn: isoDateDaysFrom(today, -receivedDaysAgo),
		summary
	});
}

/** The day so many days before the copy starts, for a brain note. */
export function daysBefore(today: string) {
	return (days: number) => isoDateDaysFrom(today, -days);
}
