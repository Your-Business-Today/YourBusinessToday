import { amountOwedOn, billingStandingLabels, billingStandingOf, type BilledInvoice, type BilledLine } from '$lib/data/billing/billedInvoice';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { invoiceFactsOf } from '$lib/components/billing/billedInvoiceView';

export const noInvoicesYet = 'Your Business Today has raised no invoices to your organisation yet.';

/** The invoices as the Billing section shows them, newest first: each with its standing, its facts and its lines. */
export function describeMyInvoices(invoices: BilledInvoice[], isPayingOpen: boolean): string {
	if (invoices.length === 0) return noInvoicesYet;
	const paying = isPayingOpen ? 'An unpaid invoice is paid by card with pay_invoice.' : 'Paying by card is not open yet.';
	return [paying, ...invoices.map(describeInvoice)].join('\n\n');
}

function describeInvoice(invoice: BilledInvoice): string {
	const standing = billingStandingLabels[billingStandingOf(invoice)];
	const facts = invoiceFactsOf(invoice, amountOwedOn(invoice)).map((fact) => `${fact.label.toLowerCase()} ${fact.value}`);
	const total = `total ${formatPoundsAndPence(invoice.total)}`;
	const heading = `Invoice ${invoice.printedNumber} — ${standing} — ${[...facts, total].join(' — ')} — invoice ${invoice.id}`;
	return [heading, ...invoice.lines.map(describeLine)].join('\n');
}

function describeLine(line: BilledLine): string {
	return `  ${line.description} — ${line.quantity} at ${formatPoundsAndPence(line.unitPrice)} — ${formatPoundsAndPence(line.amount)}`;
}
