import type { NavigationLink } from '$lib/components/site/siteNavigation';

/** One choice in a side bar picker: an organisation, or a project of the picked organisation. */
export type FramePickOption = { id: string; name: string };

/**
 * What the side bar shows: the person's organisations, the picked one's own pages and modules, and the
 * home page it opens on. The picked organisation's projects are what a project page's header switches between.
 */
export type FramePicks = {
	organisations: FramePickOption[];
	pickedOrganisationId: string | null;
	projects: FramePickOption[];
	pickedProjectId: string | null;
	organisationLinks: NavigationLink[];
	moduleLinks: NavigationLink[];
	homePath: string | null;
};

/** What the side bar sends when a person picks: an organisation, and the project when they picked one. */
export type FramePickChoice = { organisationId: string; projectId: string | null };

export const framePicksPath = '/api/frame-picks';

/** The option picked last, while it is still among the options; otherwise the first. */
export function pickRemembered<Option extends FramePickOption>(
	options: Option[],
	rememberedId: string | null
): Option | null {
	const remembered = options.find((option) => option.id === rememberedId);
	return remembered ?? options[0] ?? null;
}

export function hasOrganisationsToPick(picks: FramePicks | null): picks is FramePicks {
	if (picks === null) return false;
	const { organisations } = picks;
	return organisations.length > 0;
}
