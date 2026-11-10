export type InvoicingField = 'address' | 'contactName' | 'contactEmail' | 'contactPhone';

export const invoicingFieldLabels: Record<InvoicingField, string> = {
	address: 'Address',
	contactName: 'Accounts contact',
	contactEmail: 'Accounts email',
	contactPhone: 'Accounts phone'
};
