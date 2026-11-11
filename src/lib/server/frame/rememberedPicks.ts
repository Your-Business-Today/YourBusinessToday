import { isUuid } from '$lib/data/isUuid';
import { parsedJsonOrNull } from '$lib/data/jsonText';
import { portalOrganisationCookie } from '$lib/portal/portalVisitor';
import type { Cookies } from '@sveltejs/kit';

/** The organisation a person picked last in the side bar, and the project they picked last in each. */
export type RememberedPicks = {
	organisationId: string | null;
	projectIdByOrganisation: Record<string, string>;
};

/** A pick to remember; a client's company is also the portal's working organisation. */
export type PickToRemember = { organisationId: string; projectId: string | null; portalClientId: string | null };

const pickedOrganisationCookie = 'frame_organisation';
const pickedProjectsCookie = 'frame_projects';
const yearInSeconds = 60 * 60 * 24 * 365;
const rememberedOrganisationLimit = 20;
const cookieOptions = { path: '/', httpOnly: true, sameSite: 'lax', maxAge: yearInSeconds } as const;

/** Before anyone picks in the side bar, the portal's own company choice stands. */
export function readRememberedPicks(cookies: Cookies): RememberedPicks {
	const pickedOrganisationId = cookies.get(pickedOrganisationCookie) ?? cookies.get(portalOrganisationCookie);
	return {
		organisationId: pickedOrganisationId ?? null,
		projectIdByOrganisation: parseProjectPicks(cookies.get(pickedProjectsCookie))
	};
}

export function rememberPick(cookies: Cookies, remembered: RememberedPicks, pick: PickToRemember): void {
	cookies.set(pickedOrganisationCookie, pick.organisationId, cookieOptions);
	if (pick.portalClientId !== null) cookies.set(portalOrganisationCookie, pick.portalClientId, cookieOptions);
	if (pick.projectId === null) return;
	const projectPicks = withProjectPick(remembered.projectIdByOrganisation, pick.organisationId, pick.projectId);
	cookies.set(pickedProjectsCookie, JSON.stringify(projectPicks), cookieOptions);
}

/** The latest pick goes last, and the oldest organisations are forgotten so the cookie stays small. */
export function withProjectPick(
	projectPicks: Record<string, string>,
	organisationId: string,
	projectId: string
): Record<string, string> {
	const others = Object.entries(projectPicks).filter(([pickedOrganisationId]) => pickedOrganisationId !== organisationId);
	const latest = [...others, [organisationId, projectId]].slice(-rememberedOrganisationLimit);
	return Object.fromEntries(latest);
}

export function parseProjectPicks(cookieValue: string | undefined): Record<string, string> {
	if (cookieValue === undefined) return {};
	const parsed = parsedJsonOrNull(cookieValue);
	if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
	const entries = Object.entries(parsed as Record<string, unknown>);
	return Object.fromEntries(entries.filter(isProjectPickEntry));
}

function isProjectPickEntry(entry: [string, unknown]): entry is [string, string] {
	const [organisationId, projectId] = entry;
	return typeof projectId === 'string' && isUuid(organisationId) && isUuid(projectId);
}
