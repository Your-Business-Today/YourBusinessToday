import { portalAccessLabels, type PortalPerson } from '$lib/portal/portalPerson';

export const nobodyListedYet = 'Nobody at your organisation is on the portal yet.';
const administrator = 'administrator';

/** Everyone at the organisation as the People page lists them: name, role, email, whether they administer the portal, and their access. */
export function describePortalPeople(people: PortalPerson[]): string {
	if (people.length === 0) return nobodyListedYet;
	return people.map(describePerson).join('\n');
}

function describePerson(person: PortalPerson): string {
	const role = person.role === '' ? [] : [person.role];
	const standing = person.isAdministrator ? [administrator] : [];
	const facts = [person.name, ...role, person.email, ...standing, portalAccessLabels[person.access]];
	return `${facts.join(' — ')} — contact ${person.contactId}`;
}
