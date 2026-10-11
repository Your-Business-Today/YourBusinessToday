export type AccountsContact = { name: string; email: string; phone: string };

/** What an organisation says about itself: who it is, where invoices go, and who answers for its accounts. */
export type OrganisationDetails = { name: string; address: string; accountsContact: AccountsContact };

export const longestOrganisationName = 120;
export const longestOrganisationAddress = 500;
export const longestAccountsContactName = 120;
export const longestAccountsContactEmail = 254;
export const longestAccountsContactPhone = 40;

export const emptyAccountsContact: AccountsContact = { name: '', email: '', phone: '' };

export const organisationNeedsName = 'An organisation needs a name.';
export const accountsContactEmailRefusal =
	'The accounts contact email does not read as an email address.';

type Limit<Subject> = { label: string; longest: number; read: (subject: Subject) => string };

const detailLimits: Limit<OrganisationDetails>[] = [
	{ label: 'The organisation name', longest: longestOrganisationName, read: (details) => details.name },
	{ label: 'The address', longest: longestOrganisationAddress, read: (details) => details.address }
];

const contactLimits: Limit<AccountsContact>[] = [
	{ label: 'The accounts contact name', longest: longestAccountsContactName, read: (contact) => contact.name },
	{ label: 'The accounts contact email', longest: longestAccountsContactEmail, read: (contact) => contact.email },
	{ label: 'The accounts contact phone', longest: longestAccountsContactPhone, read: (contact) => contact.phone }
];

const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Why the details cannot be saved as they stand, or null when every value fits its column. */
export function validateOrganisationDetails(details: OrganisationDetails): string | null {
	if (details.name === '') return organisationNeedsName;
	const contact = details.accountsContact;
	const tooLong = tooLongRefusal(details, detailLimits) ?? tooLongRefusal(contact, contactLimits);
	if (tooLong !== null) return tooLong;
	if (contact.email !== '' && !emailShape.test(contact.email)) return accountsContactEmailRefusal;
	return null;
}

function tooLongRefusal<Subject>(subject: Subject, limits: Limit<Subject>[]): string | null {
	const exceeded = limits.find((limit) => limit.read(subject).length > limit.longest);
	if (exceeded === undefined) return null;
	return `${exceeded.label} is at most ${exceeded.longest} characters.`;
}
