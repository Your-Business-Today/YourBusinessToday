import { canUseOrganisationModule } from '$lib/data/organisationModuleAccess';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { readBusinessBrainChatbots } from '$lib/server/businessBrain/readBusinessBrainChatbots';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { OrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { SupabaseClient } from '@supabase/supabase-js';

const everyChatbot = null;

/** The organisation's named brains with their purposes, or null when Your Business Brain is not open to the visitor. */
export async function readBrainsOf(supabase: SupabaseClient, access: OrganisationAccess): Promise<BusinessBrainChatbot[] | null> {
	const { organisation, visitor } = access;
	const switchedOn = await getSwitchedOnModules(supabase, organisation.id);
	const isBrainOpen = canUseOrganisationModule(visitor, { organisation, switchedOn }, 'business_brain');
	if (!isBrainOpen) return null;
	return readBusinessBrainChatbots(supabase, organisation.id, everyChatbot);
}
