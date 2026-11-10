import { findPortalOrganisations } from '$lib/server/portal/findPortalOrganisations';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

/** A client a person is a contact at, named as its organisation when one is linked to it. */
export type ClientCompany = { clientId: string; name: string; organisationId: string | null };

type LinkedOrganisation = { id: string; name: string; clientId: string };

/**
 * The companies of the clients a person is a contact at. A contact may not read the organisations
 * they are not on, so the linked organisations are read with the service key, by client id.
 */
export async function findClientCompanies(clientIds: string[]): Promise<ClientCompany[]> {
	if (clientIds.length === 0) return [];
	const [clients, linkedOrganisations] = await Promise.all([
		findPortalOrganisations(clientIds),
		findLinkedOrganisations(clientIds)
	]);
	return clients.map((client) => {
		const linked = linkedOrganisations.find((organisation) => organisation.clientId === client.clientId);
		return { clientId: client.clientId, name: linked?.name ?? client.name, organisationId: linked?.id ?? null };
	});
}

async function findLinkedOrganisations(clientIds: string[]): Promise<LinkedOrganisation[]> {
	const { data, error } = await supabaseServiceClient()
		.from('organisations')
		.select('id, name, client_id')
		.in('client_id', clientIds);
	if (error) throw error;
	return data.map((row) => ({ id: row.id as string, name: row.name as string, clientId: row.client_id as string }));
}
