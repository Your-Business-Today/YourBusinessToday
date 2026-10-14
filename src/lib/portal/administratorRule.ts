import type { PortalPerson } from './portalPerson';

export const lastAdministratorRefusal =
	'Your organisation needs at least one administrator. Make someone else an administrator first.';

/** Whether a change would leave the organisation with nobody to manage its people on the portal. */
export function wouldLeaveNoAdministrator(
	people: Pick<PortalPerson, 'contactId' | 'isAdministrator'>[],
	changedContactId: string
): boolean {
	const remaining = people.filter(
		(person) => person.isAdministrator && person.contactId !== changedContactId
	);
	return remaining.length === 0;
}
