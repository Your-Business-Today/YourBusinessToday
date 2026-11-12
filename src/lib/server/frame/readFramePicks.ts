import { pickRemembered, type FramePicks } from '$lib/components/frame/framePicks';
import { organisationHomePathFor, organisationPageLinksFor } from './projectPageLinks';
import { readModuleLinks } from './moduleLinks';
import { readPickOrganisations, type PickOrganisation } from './pickOrganisations';
import { readPickProjects } from './pickProjects';
import type { FrameLink } from '$lib/components/frame/frameGroups';
import type { RememberedPicks } from './rememberedPicks';

/** The side bar's picks, with the organisation picked, which says how to remember the pick. */
export type FramePickReading = { picks: FramePicks; organisation: PickOrganisation | null };

const nothingToPick: FramePicks = {
	organisations: [],
	pickedOrganisationId: null,
	projects: [],
	pickedProjectId: null,
	organisationLinks: [],
	moduleLinks: [],
	homePath: null
};

/** Each picker opens on the one picked last, or on the first when nothing has been picked. */
export async function readFramePicks(
	locals: App.Locals,
	accountId: string,
	remembered: RememberedPicks
): Promise<FramePickReading> {
	const organisations = await readPickOrganisations(locals.supabase, accountId);
	const organisation = pickRemembered(organisations, remembered.organisationId);
	if (organisation === null) return { picks: nothingToPick, organisation };
	const [projects, moduleLinks] = await Promise.all([
		readPickProjects(locals.supabase, accountId, organisation),
		moduleLinksOf(locals, accountId, organisation)
	]);
	const project = pickRemembered(projects, remembered.projectIdByOrganisation[organisation.id] ?? null);
	const pickedProjectId = project?.id ?? null;
	const options = organisations.map(({ id, name }) => ({ id, name }));
	const picks = {
		organisations: options,
		pickedOrganisationId: organisation.id,
		projects,
		pickedProjectId,
		organisationLinks: organisationPageLinksFor(organisation, pickedProjectId),
		moduleLinks,
		homePath: organisationHomePathFor(organisation, pickedProjectId)
	};
	return { picks, organisation };
}

async function moduleLinksOf(
	locals: App.Locals,
	accountId: string,
	organisation: PickOrganisation
): Promise<FrameLink[]> {
	const { organisationId } = organisation;
	if (organisationId === null) return [];
	return readModuleLinks(locals, accountId, organisationId);
}
