import { formatPoundsAndPence } from '$lib/data/books/money';
import type { Customer } from '$lib/server/books/customerRecord';
import type { CustomerWithBalance } from '$lib/server/books/customerBalances';
import type { CustomerBalance } from '$lib/data/books/customerBalance';

const archivedMark = ' (archived: no new invoice is raised to it)';

/** The customers shown, by name, and how many archived ones were left out of them. */
export function describeCustomerBalances(organisationName: string, shown: CustomerWithBalance[], archivedLeftOut: number): string {
	const leftOut = archivedLeftOut === 0 ? [] : [`${archivedLeftOut} archived left out; shouldIncludeArchived true lists them.`];
	if (shown.length === 0 && archivedLeftOut === 0) return `${organisationName}'s books hold no customers yet, so no invoice can be raised.`;
	if (shown.length === 0) return [`${organisationName}'s books hold no customers in use.`, ...leftOut].join('\n');
	return [`Customers of ${organisationName}, by name:`, ...shown.map(describeCustomerWithBalance), ...leftOut].join('\n');
}

export function describeCustomer(customer: Customer): string {
	const archived = customer.isArchived ? archivedMark : '';
	const contact = [customer.contactName, customer.email].filter((detail) => detail !== '').join(', ');
	const sentTo = contact === '' ? 'no one named to send invoices to' : contact;
	const address = customer.address === '' ? 'no address' : customer.address.replaceAll('\n', ', ');
	const link = customer.clientId === null ? '' : ` Client on the register: ${customer.clientId}.`;
	return `- ${customer.name}${archived}: ${sentTo}; ${address}.${link} Id ${customer.id}`;
}

function describeCustomerWithBalance({ customer, balance }: CustomerWithBalance): string {
	return `${describeCustomer(customer)}\n  ${describeBalance(balance)}`;
}

function describeBalance(balance: CustomerBalance): string {
	if (balance.invoiceCount === 0) return 'No invoices raised yet.';
	const invoices = balance.invoiceCount === 1 ? '1 invoice' : `${balance.invoiceCount} invoices`;
	return `${invoices}; owes ${formatPoundsAndPence(balance.owed)} on ${balance.unpaidInvoiceCount} issued and unpaid.`;
}
