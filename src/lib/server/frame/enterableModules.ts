import { canEnterBoardroom } from '$lib/data/boardroomAccess';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import type { ModuleOrganisation } from '$lib/data/organisationModuleAccess';
import type { OrganisationModule } from '$lib/data/organisationModules';
import type { OrganisationVisitor } from '$lib/data/organisationAccess';

const boardroomModule: OrganisationModule = 'boardroom';

/** The usable modules whose pages the person may enter: the Boardroom only for a named director of the organisation. */
export async function enterableModules(
	locals: App.Locals,
	visitor: OrganisationVisitor,
	place: ModuleOrganisation,
	usable: OrganisationModule[]
): Promise<OrganisationModule[]> {
	if (!usable.includes(boardroomModule)) return usable;
	const { organisation } = place;
	const directors = await getDirectorsOfOrganisation(locals.supabase, organisation.id);
	if (canEnterBoardroom(visitor, { ...place, directors })) return usable;
	return usable.filter((module) => module !== boardroomModule);
}
