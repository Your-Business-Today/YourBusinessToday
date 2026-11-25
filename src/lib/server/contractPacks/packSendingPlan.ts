import { portalAddress } from '$lib/portal/portalAddress';
import { portalContractPath } from '$lib/portal/portalPaths';
import { portalOrganisationParameter } from '$lib/portal/portalVisitor';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { contractPackEmailSubject } from '$lib/server/email/contractPackEmail';
import { emailSenders } from '$lib/server/mcp/sendsEmail';
import { findClientIdForOrganisation } from './contractPackTables';
import { packSendingRefusal, recipientRefusal } from './packSendingRefusals';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractPack, PackSendingPlan } from '$lib/data/contractPack';

import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export type { PackSendingPlan };

/** The pack's sending, shown before it goes, or why it cannot go; the contact named, else the signatory, else the main contact. */
export async function planPackSending(supabase: SupabaseClient, organisation: Organisation, pack: ContractPack, contactId: string | null): Promise<PackSendingPlan | string> {
	const packRefusal = packSendingRefusal(pack);
	if (packRefusal !== null) return packRefusal;
	const clientId = await findClientIdForOrganisation(supabase, organisation.id);
	if (clientId === null) return `${organisation.name} is not linked to a client on the register, so it has no contacts to send the pack to.`;
	const contacts = await getContactsForClient(supabase, clientId);
	const contact = chosenContact(contacts, contactId, organisation.signatoryEmail);
	if (contact === undefined) return `No contact at ${organisation.name} has that id; read_client lists who is listed there.`;
	const refusal = recipientRefusal(contact);
	if (refusal !== null) return refusal;
	return planFor(organisation.name, pack, contact, clientId);
}

function chosenContact(contacts: ClientContact[], contactId: string | null, signatoryEmail: string): ClientContact | undefined {
	if (contactId !== null) return contacts.find((contact) => contact.id === contactId);
	const signatoryAddress = signatoryEmail.toLowerCase();
	const signatory = contacts.find((contact) => contact.email.toLowerCase() === signatoryAddress);
	if (signatoryAddress === '' || signatory === undefined) return contacts[0];
	return signatory;
}

function planFor(clientName: string, pack: ContractPack, contact: ClientContact, clientId: string): PackSendingPlan {
	return {
		packId: pack.id,
		from: emailSenders.yourBusinessToday,
		clientName,
		contact: { id: contact.id, name: contact.name, email: contact.email },
		documents: pack.documents.map(({ title, versionNumber }) => ({ title, versionNumber })),
		subject: contractPackEmailSubject(clientName),
		packUrl: `${portalAddress.origin}${portalContractPath}?${portalOrganisationParameter}=${clientId}`
	};
}
