import { addClientContact } from '$lib/server/clients/addClientContact';
import { addOrganisationMember } from '$lib/server/organisations/addOrganisationMember';
import { arrivalFor } from './setUpArrival';
import { clientSetUpEmailSubject, renderClientSetUpEmail } from '$lib/server/email/clientSetUpEmail';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { linkContactToAccount } from '$lib/server/clients/linkContactToAccount';
import { makePortalAdministrator } from '$lib/server/clients/makePortalAdministrator';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { SetUpPerson } from '$lib/onboarding/onboarding';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where the people are being set up: the client, its organisation, and who is setting them up from where. */
export type SetUpPlace = {
	service: SupabaseClient;
	clientId: string;
	organisationId: string;
	organisationName: string;
	origin: string;
	actorAccountId: string;
};

export type SetUpInvitation = SetUpPerson & { delivery: EmailDelivery };

/**
 * Puts one of the client's first people on its organisation with a sign-in of their own and sends them the one
 * email. The first person named manages the organisation and administers its portal.
 */
export async function inviteSetUpPerson(
	place: SetUpPlace,
	person: SetUpPerson,
	isFirstPerson: boolean
): Promise<SetUpInvitation> {
	const { service, clientId, organisationId, actorAccountId } = place;
	const contact = await contactFor(place, person);
	const arrival = await arrivalFor(contact, place.origin);
	await linkContactToAccount(service, contact.id, arrival.accountId);
	if (isFirstPerson) await makePortalAdministrator(service, contact.id);
	const membership = { organisationId, accountId: arrival.accountId, isManager: isFirstPerson, addedBy: actorAccountId };
	await addOrganisationMember(service, membership);
	const delivery = await sendTransactionalEmail({
		to: person.email,
		subject: clientSetUpEmailSubject(place.organisationName),
		html: renderClientSetUpEmail({ personName: person.name, organisationName: place.organisationName, ...arrival })
	});
	await recordClientEvent(service, clientId, 'contact_invited', { email: person.email }, actorAccountId);
	return { ...person, delivery };
}

/** The person as listed at the client, listing them first when they are not: never a second listing. */
async function contactFor(place: SetUpPlace, person: SetUpPerson): Promise<ClientContact> {
	const listed = await findListedContact(place, person);
	if (listed !== null) return listed;
	const seed = { name: person.name, email: person.email, phone: '', role: '', isPrimary: false };
	await addClientContact(place.service, place.clientId, seed, place.actorAccountId);
	const added = await findListedContact(place, person);
	if (added === null) throw new Error(`${person.email} could not be listed at the client`);
	return added;
}

async function findListedContact(place: SetUpPlace, person: SetUpPerson): Promise<ClientContact | null> {
	const contacts = await getContactsForClient(place.service, place.clientId);
	const listed = contacts.find((contact) => contact.email.toLowerCase() === person.email);
	return listed ?? null;
}
