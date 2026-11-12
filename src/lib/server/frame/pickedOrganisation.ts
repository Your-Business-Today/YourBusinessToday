import { pickRemembered } from '$lib/components/frame/framePicks';
import { readPickOrganisations } from './pickOrganisations';

/**
 * The organisation picked in the side bar, as a form posted from one of its pages reads it: one the
 * person reaches, or null when what is picked is a client's company seen through the portal.
 */
export async function readPickedOrganisationId(locals: App.Locals, accountId: string): Promise<string | null> {
	const { supabase, rememberedPicks } = locals;
	const organisations = await readPickOrganisations(supabase, accountId);
	const picked = pickRemembered(organisations, rememberedPicks.organisationId);
	return picked?.organisationId ?? null;
}
