import { canUseOrganisationModule } from '$lib/data/organisationModuleAccess';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import type { OrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Whether Your Business Brain is switched on for the organisation and open to the visitor. */
export async function isBusinessBrainOpen(supabase: SupabaseClient, access: OrganisationAccess): Promise<boolean> {
	const { organisation, visitor } = access;
	const switchedOn = await getSwitchedOnModules(supabase, organisation.id);
	return canUseOrganisationModule(visitor, { organisation, switchedOn }, 'business_brain');
}

