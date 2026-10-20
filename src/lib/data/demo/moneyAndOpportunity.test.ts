import { describe, expect, it } from 'vitest';
import { cancelSubscription, chaseInvoice, chaseQuote, raiseInvoice, remember, type DemoChange } from './demoActions';
import { DemoLimit } from './demoLimits';
import { findMoneyAndOpportunity } from './moneyAndOpportunity';
import { seedDemoBusiness } from './seed/seedDemoBusiness';
import { DemoJobId } from './seed/seedClientsAndJobs';
import type { DemoBusiness } from './demoBusiness';

const today = '2026-10-20';
const business = seedDemoBusiness(today);

function figureOf(title: string, measured: DemoBusiness = business): number {
	const findings = findMoneyAndOpportunity(measured, today);
	return findings.find((finding) => finding.title === title)?.figure ?? 0;
}

function businessAfter(change: DemoChange | string): DemoBusiness {
	if (typeof change === 'string') throw new Error(change);
	return change.business;
}

describe('money and opportunity on the fresh demo', () => {
	it('adds up the work done that no invoice covers', () => {
		expect(figureOf('Work done but not yet invoiced')).toBe(14_650);
	});

	it('adds up the unpaid invoices past their due date', () => {
		expect(figureOf('Invoices past their due date')).toBe(41_100);
	});

	it('adds up quotes sent more than a fortnight ago and never followed up', () => {
		expect(figureOf('Quotes sent and never followed up')).toBe(23_000);
	});

	it('counts a subscription on a second card for a year', () => {
		expect(figureOf('Subscriptions paid twice, per year')).toBe(302);
	});
});

describe('the actions change the figures', () => {
	it('raising an invoice clears a job from the unbilled work', () => {
		const change = raiseInvoice(business, DemoJobId.plotFourKitchen, today);
		const after = businessAfter(change);
		expect(after.invoices.at(-1)?.id).toBe('INV-1053');
		expect(figureOf('Work done but not yet invoiced', after)).toBe(4_250);
	});

	it('refuses a job that has nothing unbilled, by name', () => {
		expect(raiseInvoice(business, DemoJobId.hotelBar, today)).toContain('nothing unbilled');
	});

	it('chasing an invoice records the chase and logs it', () => {
		const { invoices, log } = businessAfter(chaseInvoice(business, 'INV-1041', today));
		const chased = invoices.find((invoice) => invoice.id === 'INV-1041');
		expect(chased?.chasedOn).toBe(today);
		expect(log.at(-1)?.sentence).toContain('Chased INV-1041');
	});

	it('following up a quote takes it out of the quiet quotes', () => {
		const after = businessAfter(chaseQuote(business, 'QUO-0318', today));
		expect(figureOf('Quotes sent and never followed up', after)).toBe(5_200);
	});

	it('cancelling the second copy of a subscription halves the duplicate figure', () => {
		const after = businessAfter(cancelSubscription(business, 'SUB-04', today));
		expect(figureOf('Subscriptions paid twice, per year', after)).toBe(120);
	});

	it('refuses an unknown id by name', () => {
		expect(chaseInvoice(business, 'INV-9999', today)).toContain('no invoice INV-9999');
	});
});

describe('the brain', () => {
	it('keeps a note and says so', () => {
		const note = 'We never start a job without a signed order.';
		const { brain } = businessAfter(remember(business, note, today));
		expect(brain.at(-1)?.note).toBe(note);
	});

	it('refuses a note longer than the brain keeps', () => {
		const tooLong = 'a'.repeat(DemoLimit.noteLength + 1);
		expect(remember(business, tooLong, today)).toContain(`up to ${DemoLimit.noteLength}`);
	});
});
