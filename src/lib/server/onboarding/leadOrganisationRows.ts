import type { SupabaseClient } from '@supabase/supabase-js';
import { linkColumns, linkOf, type OrganisationLink } from './organisationLinks';

const uniqueViolation = '23505';

/** Links an organisation that is linked to nothing yet, read back; null when a company took it, or already has one. */
export async function linkOrganisationToClient(
	service: SupabaseClient,
	organisationId: string,
	clientId: string
): Promise<OrganisationLink | null> {
	const { data, error } = await service
		.from('organisations')
		.update({ client_id: clientId })
		.eq('id', organisationId)
		.is('client_id', null)
		.select(linkColumns)
		.maybeSingle();
	if (error !== null && error.code === uniqueViolation) return null;
	if (error) throw error;
	return linkOf(data);
}

/** A new organisation in the company's name and linked to it; null when that name is taken. */
export async function createOrganisationForClient(
	service: SupabaseClient,
	name: string,
	clientId: string,
	accountId: string
): Promise<OrganisationLink | null> {
	const { data, error } = await service
		.from('organisations')
		.insert({ name, client_id: clientId, created_by: accountId })
		.select(linkColumns)
		.maybeSingle();
	if (error !== null && error.code === uniqueViolation) return null;
	if (error) throw error;
	return linkOf(data);
}
