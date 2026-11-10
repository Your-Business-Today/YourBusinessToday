import { countContactInvitesThisHour } from '$lib/server/clients/recentContactInviteCount';
import { getClient } from '$lib/server/clients/getClient';
import { hasRoomForInvites, tooManyInvitesMessage } from '$lib/server/email/inviteAllowance';
import { inviteSetUpPerson, type SetUpInvitation, type SetUpPlace } from './inviteSetUpPerson';
import { fitsOrganisationName, longestOrganisationName } from '$lib/data/organisationRules';
import { onboardingProjectFor } from './onboardingProjectFor';
import { organisationForClient } from './organisationForClient';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Client } from '$lib/server/clients/clientRecord';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { SetUpPerson } from '$lib/onboarding/onboarding';

export type ClientSetUpRequest = {
	clientId: string;
	people: SetUpPerson[];
	origin: string;
	actorAccountId: string;
};

export type ClientSetUp = { organisationName: string; invitations: SetUpInvitation[] };

export const noClientToSetUp: Refusal = {
	refusal: 'No client on the register has that id. Set a client up from its own page on the register.'
};

const organisationNameTooLong: Refusal = {
	refusal: `The client’s name becomes its organisation’s name, which is at most ${longestOrganisationName} characters. Shorten the name on the register first.`
};

const organisationNameTaken = (client: Client): Refusal => ({
	refusal: `Another organisation is already called ${client.name}. Rename one of them, then set ${client.name} up.`
});

/**
 * Sets a client already on the register up in one step: its organisation and Onboarding project, made once,
 * and its first people, each with a sign-in and one email. Only staff reach this, and the values are checked
 * before it runs, so it writes with the service key. Running it again makes nothing twice.
 */
export async function setClientUp(request: ClientSetUpRequest): Promise<ClientSetUp | Refusal> {
	const service = supabaseServiceClient();
	const { people, actorAccountId } = request;
	const client = await getClient(service, request.clientId);
	if (client === null) return noClientToSetUp;
	const isNameTooLongForAnOrganisation = !fitsOrganisationName(client.name);
	if (isNameTooLongForAnOrganisation) return organisationNameTooLong;
	const invitesThisHour = await countContactInvitesThisHour(service, actorAccountId);
	if (!hasRoomForInvites(invitesThisHour, people.length)) return { refusal: tooManyInvitesMessage };
	const organisationId = await organisationForClient(service, client.id, client.name, actorAccountId);
	if (organisationId === null) return organisationNameTaken(client);
	await onboardingProjectFor(service, { organisationId, clientId: client.id, accountId: actorAccountId });
	const place = { service, clientId: client.id, organisationId, organisationName: client.name, origin: request.origin, actorAccountId };
	const invitations = await invitePeopleInTurn(place, people);
	const detail = { organisation: client.name, people: people.map((person) => person.email) };
	await recordClientEvent(service, client.id, 'client_set_up', detail, actorAccountId);
	return { organisationName: client.name, invitations };
}

/** One at a time, so each person is found on the client's list before the next is added to it. */
async function invitePeopleInTurn(place: SetUpPlace, people: SetUpPerson[]): Promise<SetUpInvitation[]> {
	const invitations: SetUpInvitation[] = [];
	for (const [position, person] of people.entries()) {
		const isFirstPerson = position === 0;
		invitations.push(await inviteSetUpPerson(place, person, isFirstPerson));
	}
	return invitations;
}
