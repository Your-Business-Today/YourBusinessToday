import { DemoInvoiceStatus, DemoQuoteStatus, type DemoInvoice, type DemoQuote } from '../../demoBusiness';
import { invoiceIssuedBefore, quoteSentBefore } from '../datedRecords';
import { PracticeClientId, PracticeJobId } from './seedClientsAndJobs';

const { coffee, plumbing, dental, architects, garage } = PracticeClientId;

export function seedQuotes(today: string): DemoQuote[] {
	const { sent, accepted, declined } = DemoQuoteStatus;
	const quote = quoteSentBefore(today);
	return [
		quote('QUO-0512', architects, 'Monthly bookkeeping and VAT returns, a year from November', 4_800, 27, sent, null),
		quote('QUO-0518', garage, 'Monthly bookkeeping, a year from November', 2_400, 6, sent, null),
		quote('QUO-0507', dental, 'Year-end accounts and the partners’ self-assessment returns', 3_600, 45, sent, null),
		quote('QUO-0501', coffee, 'Payroll for three new staff', 1_200, 60, accepted, 41),
		quote('QUO-0509', plumbing, 'Making Tax Digital set-up', 650, 38, declined, 20)
	];
}

export function seedInvoices(today: string): DemoInvoice[] {
	const { unpaid, paid } = DemoInvoiceStatus;
	const invoice = invoiceIssuedBefore(today);
	return [
		invoice('INV-3108', dental, PracticeJobId.dentalPayroll, 1_400, 58, unpaid),
		invoice('INV-3115', architects, PracticeJobId.architectsCatchUp, 5_400, 44, unpaid),
		invoice('INV-3121', coffee, PracticeJobId.coffeeVatQuarter, 1_900, 12, unpaid),
		invoice('INV-3102', dental, PracticeJobId.dentalPayroll, 1_400, 88, paid),
		invoice('INV-3111', dental, PracticeJobId.dentalPayroll, 1_400, 28, paid)
	];
}
