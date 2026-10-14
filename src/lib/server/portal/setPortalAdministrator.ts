import { lastAdministratorRefusal, wouldLeaveNoAdministrator } from '$lib/portal/administratorRule';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import {
	getAdministratorStanding,
	getContactAtOrganisation,
	notAtYourOrganisation
} from './contactAtOrganisation';
import type { AdministratorChoice } from './validatePortalPerson';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import type { Refusal } from './portalFormReading';

/** Makes a person at the organisation an administrator of its portal, or not, keeping at least one. */
export async function setPortalAdministrator(
	visitor: PortalVisitor,
	choice: AdministratorChoice,
	actorAccountId: string
): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const contact = await getContactAtOrganisation(service, visitor, choice.contactId);
	if (contact === null) return notAtYourOrganisation;
	const people = await getAdministratorStanding(service, visitor.clientId);
	const isStepDown = !choice.isAdministrator;
	if (isStepDown && wouldLeaveNoAdministrator(people, contact.id))
		return { refusal: lastAdministratorRefusal };
	const { error } = await service
		.from('client_contacts')
		.update({ is_portal_administrator: choice.isAdministrator })
		.eq('id', contact.id);
	if (error) throw error;
	const detail = { name: contact.name, isAdministrator: choice.isAdministrator };
	await recordClientEvent(
		service,
		visitor.clientId,
		'administrator_changed',
		detail,
		actorAccountId
	);
	return null;
}
