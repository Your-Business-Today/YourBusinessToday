import { lastAdministratorRefusal, wouldLeaveNoAdministrator } from '$lib/portal/administratorRule';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import {
	getAdministratorStanding,
	getContactAtOrganisation,
	notAtYourOrganisation
} from './contactAtOrganisation';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import type { Refusal } from './portalFormReading';

const removingYourself: Refusal = {
	refusal: 'You cannot remove yourself. Ask another administrator at your organisation.'
};

/**
 * Takes a person off the organisation: they can no longer sign in to its portal. The person stays on YBT's
 * own register; only their place at the organisation goes, and the change is kept on the client's history.
 */
export async function removePortalPerson(
	visitor: PortalVisitor,
	contactId: string,
	actorAccountId: string
): Promise<Refusal | null> {
	if (contactId === visitor.contactId) return removingYourself;
	const service = supabaseServiceClient();
	const contact = await getContactAtOrganisation(service, visitor, contactId);
	if (contact === null) return notAtYourOrganisation;
	const people = await getAdministratorStanding(service, visitor.clientId);
	if (wouldLeaveNoAdministrator(people, contactId)) return { refusal: lastAdministratorRefusal };
	const { error } = await service.from('client_contacts').delete().eq('id', contactId);
	if (error) throw error;
	const detail = { name: contact.name, email: contact.email };
	await recordClientEvent(service, visitor.clientId, 'contact_removed', detail, actorAccountId);
	return null;
}
