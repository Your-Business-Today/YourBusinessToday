import { leadsRegister } from '$lib/data/salesRegisters';
import { leaveOutLeadOrganisations } from '$lib/data/pickableOrganisations';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { getOrganisations } from './getOrganisations';
import type { Organisation } from './organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The organisations opened for a company whose stage still puts it on the Leads register. The register is staff's
 * alone and a member of the organisation may not be staff, so the links and stages are read with the service key.
 */
export async function findLeadOrganisationIds(): Promise<Set<string>> {
	const service = supabaseServiceClient();
	const { data: links, error: linkError } = await service.from('organisations').select('id, client_id').not('client_id', 'is', null);
	if (linkError) throw linkError;
	if (links.length === 0) return new Set();
	const clientIds = links.map((link) => link.client_id as string);
	const { data: leads, error: leadError } = await service.from('clients').select('id').in('id', clientIds).in('lifecycle_stage', leadsRegister.stages);
	if (leadError) throw leadError;
	const leadIds = new Set(leads.map((lead) => lead.id as string));
	return new Set(links.filter((link) => leadIds.has(link.client_id as string)).map((link) => link.id as string));
}

/** The organisations the person can choose between, less a lead's until the company becomes a client. */
export async function getPickableOrganisations(supabase: SupabaseClient, keptOrganisationId: string | null = null): Promise<Organisation[]> {
	const [organisations, leadOrganisationIds] = await Promise.all([getOrganisations(supabase), findLeadOrganisationIds()]);
	return leaveOutLeadOrganisations(organisations, leadOrganisationIds, keptOrganisationId);
}
