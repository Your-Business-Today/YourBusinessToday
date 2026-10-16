import type { SupabaseClient } from '@supabase/supabase-js';

const uniqueViolation = '23505';

/** The organisation already made for the client, or a new one in the business's name; null when that name is taken. */
export async function organisationForClient(
	service: SupabaseClient,
	clientId: string,
	businessName: string,
	accountId: string
): Promise<string | null> {
	const existingOrganisationId = await findOrganisationOfClient(service, clientId);
	if (existingOrganisationId !== null) return existingOrganisationId;
	const { data, error } = await service
		.from('organisations')
		.insert({ name: businessName, client_id: clientId, created_by: accountId })
		.select('id')
		.maybeSingle();
	if (error !== null && error.code === uniqueViolation) return null;
	if (error) throw error;
	return (data?.id as string) ?? null;
}

async function findOrganisationOfClient(
	service: SupabaseClient,
	clientId: string
): Promise<string | null> {
	const { data, error } = await service
		.from('organisations')
		.select('id')
		.eq('client_id', clientId)
		.maybeSingle();
	if (error) throw error;
	return (data?.id as string) ?? null;
}

/** Organisation names are unique among the top-level organisations, whatever their case. */
export async function isOrganisationNameTaken(
	service: SupabaseClient,
	businessName: string
): Promise<boolean> {
	const { data, error } = await service
		.from('organisations')
		.select('name')
		.is('parent_organisation_id', null);
	if (error) throw error;
	const wantedName = businessName.toLowerCase();
	return data.some((row) => String(row.name).toLowerCase() === wantedName);
}
