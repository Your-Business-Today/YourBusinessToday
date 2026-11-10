/** The status values books_invoices accepts (migration 0151), as yourbooks.today names them. */
export const InvoiceStatuses = {
	draft: 'draft',
	issued: 'issued',
	paid: 'paid',
	void: 'void'
} as const;

export type InvoiceStatus = (typeof InvoiceStatuses)[keyof typeof InvoiceStatuses];

export const invoiceStatusNames = Object.values(InvoiceStatuses);

export function isInvoiceStatus(candidate: unknown): candidate is InvoiceStatus {
	return invoiceStatusNames.includes(candidate as InvoiceStatus);
}

/** An issued invoice is the one a customer still owes on; a draft is not yet owed, and a paid or void one no longer is. */
export function isInvoiceOutstanding(status: InvoiceStatus): boolean {
	return status === InvoiceStatuses.issued;
}
