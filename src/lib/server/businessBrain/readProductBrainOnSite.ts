import { canUseOrganisationModule } from '$lib/data/organisationModuleAccess';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { readBrainIndexOfParts, type BusinessBrainIndex } from './readBusinessBrainIndex';
import { readOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { readPartsTiedTo } from './productBrainParts';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { Project } from '$lib/server/projects/projectRecord';

/** A product's brain as its Domain tab shows it: the parts tied to it and the pages they hold. */
export type ProductBrainOnSite = { organisationId: string; parts: BusinessBrainPartKind[]; index: BusinessBrainIndex };

/** The product's brain, or null when its organisation's Your Business Brain is not open to the viewer. */
export async function readProductBrainOnSite(locals: App.Locals, project: Project): Promise<ProductBrainOnSite | null> {
	const { organisationId } = project;
	if (organisationId === null) return null;
	const access = await readOrganisationAccess(locals, organisationId);
	if (access === null) return null;
	const { supabase } = locals;
	const { organisation, visitor } = access;
	const switchedOn = await getSwitchedOnModules(supabase, organisationId);
	const isBrainOpen = canUseOrganisationModule(visitor, { organisation, switchedOn }, 'business_brain');
	if (!isBrainOpen) return null;
	const parts = await readPartsTiedTo(supabase, { organisationId, projectId: project.id });
	const index = await readBrainIndexOfParts(supabase, organisationId, parts);
	return { organisationId, parts, index };
}
