import { differenceOf, roundToPence, sumMoney } from './money';
import { isInvoiceOutstanding, type InvoiceStatus } from './invoiceStatuses';

/** One invoice in an organisation's books: whose it is and where it stands. */
export type InvoiceStanding = { id: string; customerId: string; status: InvoiceStatus };

/** An amount held against one invoice: a line's total or a payment. */
export type InvoiceAmount = { invoiceId: string; amount: number };

/** How a customer stands: every invoice raised to it, and what it still owes on the ones issued and not yet paid. */
export type CustomerBalance = { invoiceCount: number; unpaidInvoiceCount: number; owed: number };

const nothingRaised: CustomerBalance = { invoiceCount: 0, unpaidInvoiceCount: 0, owed: 0 };

/** A line's total to the penny, as yourbooks.today rounds it: quantity times unit price. */
export function invoiceLineTotal(quantity: number, unitPrice: number): number {
	return roundToPence(quantity * unitPrice);
}

/** Each customer's balance, by customer id; a customer with no invoices is not in it and owes nothing. */
export function balancesOfCustomers(invoices: InvoiceStanding[], lineTotals: InvoiceAmount[], payments: InvoiceAmount[]): Map<string, CustomerBalance> {
	const amounts = { totals: sumByInvoice(lineTotals), paid: sumByInvoice(payments) };
	const balances = new Map<string, CustomerBalance>();
	for (const invoice of invoices) {
		const balance = balances.get(invoice.customerId) ?? nothingRaised;
		balances.set(invoice.customerId, addInvoice(balance, invoice, amounts));
	}
	return balances;
}

export function balanceOf(balances: Map<string, CustomerBalance>, customerId: string): CustomerBalance {
	return balances.get(customerId) ?? nothingRaised;
}

type AmountsByInvoice = { totals: Map<string, number>; paid: Map<string, number> };

function addInvoice(balance: CustomerBalance, invoice: InvoiceStanding, amounts: AmountsByInvoice): CustomerBalance {
	const invoiceCount = balance.invoiceCount + 1;
	if (!isInvoiceOutstanding(invoice.status)) return { ...balance, invoiceCount };
	const total = amounts.totals.get(invoice.id) ?? 0;
	const paid = amounts.paid.get(invoice.id) ?? 0;
	return { invoiceCount, unpaidInvoiceCount: balance.unpaidInvoiceCount + 1, owed: sumMoney([balance.owed, differenceOf(total, paid)]) };
}

function sumByInvoice(amounts: InvoiceAmount[]): Map<string, number> {
	const sums = new Map<string, number>();
	for (const held of amounts) sums.set(held.invoiceId, sumMoney([sums.get(held.invoiceId) ?? 0, held.amount]));
	return sums;
}
