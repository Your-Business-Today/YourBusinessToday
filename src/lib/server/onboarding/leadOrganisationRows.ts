import type { SupabaseClient } from '@supabase/supabase-js';

/** An organisation as far as a company on the register needs it: which it is, its name and the company it is linked to. */
export type OrganisationLink = { id: string; name: string; clientId: string | null };

const uniqueViolation = '23505';
const linkColumns = 'id, name, client_id';

function linkOf(row: Record<string, unknown> | null): OrganisationLink | null {
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
