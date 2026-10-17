import type { PortalOrganisation } from './portalVisitor';

type OrganisationContact = { clientId: string };

/**
 * The contact a person is working as: the one at the organisation they chose, while they are still
 * a contact there, otherwise the one at the first of their organisations by name.
 */
export function chooseVisitorContact<Contact extends OrganisationContact>(
	contacts: Contact[],
	organisations: PortalOrganisation[],
	chosenClientId: string | null
): Contact {
	const chosen = contacts.find((contact) => contact.clientId === chosenClientId);
	if (chosen !== undefined) return chosen;
	const [firstOrganisation] = organisations;
	const first = contacts.find((contact) => contact.clientId === firstOrganisation?.clientId);
	return first ?? contacts[0];
}
