import { isEmailShaped } from '../emailShape';

/** Who an invoice is made out and sent to, as books_customers holds it (migration 0151). */
export type CustomerDetails = { name: string; contactName: string; email: string; address: string };

export type CustomerDetail = keyof CustomerDetails;

/** The details a person asked to change, and whether to archive; everything left out keeps what the books hold. */
export type CustomerChange = Partial<CustomerDetails> & { isArchived?: boolean };

/** Each detail's column in books_customers, stated once for reading and writing. */
export const customerDetailColumns: Record<CustomerDetail, string> = {
	name: 'name',
	contactName: 'contact_name',
	email: 'email',
	address: 'address'
};

export const customerDetailNames = Object.keys(customerDetailColumns) as CustomerDetail[];

const detailLeftOut = '';

/** The customer as given, or the first reason it cannot be kept: never trimmed or filled in beyond the empty column default. */
export function validateNewCustomer(fields: Record<string, unknown>): CustomerDetails | string {
	const refusal = nameRefusal(fields.name) ?? givenDetailsRefusal(fields);
	if (refusal !== null) return refusal;
	const detailOf = (name: CustomerDetail) => (fields[name] ?? detailLeftOut) as string;
	return { name: detailOf('name'), contactName: detailOf('contactName'), email: detailOf('email'), address: detailOf('address') };
}

/** The change as given, or the first reason it cannot be made; a change of a link alone counts as a change. */
export function validateCustomerChange(fields: Record<string, unknown>): CustomerChange | string {
	const givenDetails = customerDetailNames.filter((name) => fields[name] !== undefined);
	const isArchiveGiven = fields.isArchived !== undefined;
	const isLinkGiven = fields.clientId !== undefined || fields.billedOrganisationId !== undefined;
	const isNothingGiven = givenDetails.length === 0 && !isArchiveGiven && !isLinkGiven;
	if (isNothingGiven) return 'No change was given. Give at least one detail, and leave out the rest to keep them.';
	const refusal = givenDetailsRefusal(fields) ?? archiveRefusal(fields.isArchived);
	if (refusal !== null) return refusal;
	const change: CustomerChange = Object.fromEntries(givenDetails.map((name) => [name, fields[name]]));
	if (isArchiveGiven) change.isArchived = fields.isArchived as boolean;
	return change;
}

/** Why the answer to "include archived customers?" is not a yes or a no, or null when it is or was left out. */
export function includeArchivedRefusal(shouldIncludeArchived: unknown): string | null {
	if (shouldIncludeArchived === undefined || typeof shouldIncludeArchived === 'boolean') return null;
	return `shouldIncludeArchived is true or false; ${JSON.stringify(shouldIncludeArchived)} was given.`;
}

function givenDetailsRefusal(fields: Record<string, unknown>): string | null {
	const refusals = [
		fields.name === undefined ? null : nameRefusal(fields.name),
		textRefusal('contactName', fields.contactName),
		textRefusal('address', fields.address),
		emailRefusal(fields.email)
	];
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function nameRefusal(name: unknown): string | null {
	if (name === undefined) return 'name is needed: it is who every invoice is made out to.';
	if (typeof name !== 'string') return `name is text; ${JSON.stringify(name)} was given.`;
	if (name.trim() === '') return 'name cannot be blank: it is who every invoice is made out to.';
	const hasSpaceAtItsEdges = name.trim() !== name;
	if (hasSpaceAtItsEdges) return 'name starts or ends with a space; give it without one.';
	return null;
}

function textRefusal(field: CustomerDetail, value: unknown): string | null {
	if (value === undefined || typeof value === 'string') return null;
	return `${field} is text; ${JSON.stringify(value)} was given.`;
}

function emailRefusal(email: unknown): string | null {
	const typeRefusal = textRefusal('email', email);
	if (typeRefusal !== null) return typeRefusal;
	const isLeftEmpty = email === undefined || email === detailLeftOut;
	if (isLeftEmpty || isEmailShaped(email as string)) return null;
	return `email is the address invoices are sent to, such as accounts@example.com; ${JSON.stringify(email)} was given.`;
}

function archiveRefusal(isArchived: unknown): string | null {
	if (isArchived === undefined || typeof isArchived === 'boolean') return null;
	return `isArchived is true to archive the customer or false to bring it back; ${JSON.stringify(isArchived)} was given.`;
}
