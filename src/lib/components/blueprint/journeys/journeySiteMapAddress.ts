import { blueprintQueryKeys, linkedValueOf } from '$lib/components/blueprint/blueprintViews';
import { journeysThrough, rolesOf } from '$lib/data/journeyMap/journeyMapReading';
import { viewOfShape } from './journeyViews';
import type { JourneyMap, MapView } from '$lib/data/journeyMap/journeyMap';

/** What the Site map tab keeps in its address: the role whose journeys are drawn, and the view chosen. */
export const journeyQueryKeys = { role: 'role', view: blueprintQueryKeys.screen } as const;

export type JourneyChoice = { role?: string; route?: string };

export function journeySiteMapHref(projectId: string, choice: JourneyChoice): string {
	const query = new URLSearchParams();
	if (choice.role !== undefined) query.set(journeyQueryKeys.role, choice.role);
	if (choice.route !== undefined) query.set(journeyQueryKeys.view, choice.route);
	return `/projects/${projectId}/site-map?${query}`;
}

/** The view the address chose, when the version files one of that route's shape. */
export function chosenViewOf(address: URL, journeyMap: JourneyMap): MapView | undefined {
	const route = linkedValueOf(address, journeyQueryKeys.view);
	return route === null ? undefined : viewOfShape(journeyMap, route);
}

/** The role the address chose; else the first whose journeys pass through the chosen view; else the first role filed. */
export function chosenRoleOf(address: URL, journeyMap: JourneyMap, chosenView: MapView | undefined): string | undefined {
	const roles = rolesOf(journeyMap);
	const asked = linkedValueOf(address, journeyQueryKeys.role);
	if (asked !== null && roles.includes(asked)) return asked;
	const [firstRole] = roles;
	if (chosenView === undefined) return firstRole;
	const [firstJourney] = journeysThrough(journeyMap, chosenView.route).map((pass) => pass.journey);
	return firstJourney === undefined ? firstRole : firstJourney.role;
}
