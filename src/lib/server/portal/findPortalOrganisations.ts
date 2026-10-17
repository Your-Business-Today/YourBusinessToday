import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PortalOrganisation } from '$lib/portal/portalVisitor';

/**
 * The organisations a person is a contact at, by name. A contact may not read the client register,
 * so the names are read with the service key, by the ids their own contact rows carry.
 */
export async function findPortalOrganisations(clientIds: string[]): Promise<PortalOrganisation[]> {
	if (clientIds.length === 0) return [];
	const { data, error } = await supabaseServiceClient()
		.from('clients')
		.select('id, name')
		.in('id', clientIds)
		.order('name');
	if (error) throw error;
	return data.map((row) => ({ clientId: row.id as string, name: row.name as string }));
}
