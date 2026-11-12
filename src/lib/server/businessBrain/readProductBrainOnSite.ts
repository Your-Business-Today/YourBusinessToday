import { canUseOrganisationModule } from '$lib/data/organisationModuleAccess';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { organisationDomainOf } from './organisationDomainOf';
import { readBrainIndexOfParts, readIndexOfProductPages, type BusinessBrainIndex } from './readBusinessBrainIndex';
import { readDomainPages } from './readDomainPages';
import { readOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { readPartsTiedTo } from './productBrainParts';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { OrganisationDomain } from '$lib/data/organisationDomain';
import type { Project } from '$lib/server/projects/projectRecord';

/** A product's brain as its Domain tab shows it: its own domain, the parts tied to it, and its own pages then theirs. */
export type ProductBrainOnSite = {
	organisationId: string;
	parts: BusinessBrainPartKind[];
	index: BusinessBrainIndex;
	domain: OrganisationDomain | null;
};

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
	const scope = { organisationId, projectId: project.id };
	const parts = await readPartsTiedTo(supabase, scope);
	const [own, tied, pages] = await Promise.all([
		readIndexOfProductPages(supabase, scope),
		readBrainIndexOfParts(supabase, organisationId, parts),
		readDomainPages(supabase, scope)
	]);
	const index = { entries: [...own.entries, ...tied.entries], pageCount: own.pageCount + tied.pageCount };
	return { organisationId, parts, index, domain: organisationDomainOf(pages) };
}
