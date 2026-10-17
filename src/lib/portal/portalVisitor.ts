/** One organisation a person is a client contact at. */
export type PortalOrganisation = { clientId: string; name: string };

export type PortalVisitor = {
	contactId: string;
	isAdministrator: boolean;
	personName: string;
	emailAddress: string;
	role: string;
	clientId: string;
	organisationName: string;
	organisations: PortalOrganisation[];
};

export const portalOrganisationCookie = 'portal_organisation';
export const portalOrganisationParameter = 'organisation';

export function hasSeveralOrganisations(visitor: PortalVisitor): boolean {
	const { organisations } = visitor;
	return organisations.length > 1;
}

export function isAmongOrganisations(visitor: PortalVisitor, clientId: string): boolean {
	return visitor.organisations.some((organisation) => organisation.clientId === clientId);
}
