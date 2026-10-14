/** Where a person at a client organisation stands with the portal. */
export type PortalAccess = 'not_invited' | 'invited' | 'signed_in';

export const portalAccessLabels: Record<PortalAccess, string> = {
	not_invited: 'Not invited',
	invited: 'Invited, not signed in yet',
	signed_in: 'Signed in'
};

/** One person at a client organisation, as its people see them on the portal. */
export type PortalPerson = {
	contactId: string;
	name: string;
	email: string;
	role: string;
	isAdministrator: boolean;
	access: PortalAccess;
};

/** The longest each value an administrator types may be: the form shows them, and the site refuses anything longer. */
export const portalPersonLimits = {
	nameLength: 200,
	emailLength: 320,
	roleLength: 200
} as const;
