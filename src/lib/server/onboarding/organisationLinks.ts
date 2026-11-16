import type { SupabaseClient } from '@supabase/supabase-js';

/** An organisation as far as a company on the register needs it: which it is, its name and the company it is linked to. */
export type OrganisationLink = { id: string; name: string; clientId: string | null };

export const linkColumns = 'id, name, client_id';

export function linkOf(row: Record<string, unknown> | null): OrganisationLink | null {
	if (row === null) return null;
	const clientId = (row.client_id as string | null) ?? null;
	return { id: row.id as string, name: row.name as string, clientId };
}

export async function findOrganisationLinkById(service: SupabaseClient, organisationId: string): Promise<OrganisationLink | null> {
	const { data, error } = await service.from('organisations').select(linkColumns).eq('id', organisationId).maybeSingle();
	if (error) throw error;
	return linkOf(data);
}

export async function findOrganisationLinkOfClient(service: SupabaseClient, clientId: string): Promise<OrganisationLink | null> {
	const { data, error } = await service.from('organisations').select(linkColumns).eq('client_id', clientId).maybeSingle();
	if (error) throw error;
	return linkOf(data);
}

/** The top-level organisation carrying exactly this name, when there is one. */
export async function findTopOrganisationNamed(service: SupabaseClient, name: string): Promise<OrganisationLink | null> {
	const { data, error } = await service
		.from('organisations')
		.select(linkColumns)
		.eq('name', name)
		.is('parent_organisation_id', null)
		.maybeSingle();
	if (error) throw error;
	return linkOf(data);
}

