import { routeShape } from '$lib/data/blueprint/mcpMap';
import { viewAtRoute } from '$lib/data/journeyMap/journeyMapReading';
import type { JourneyMap, MapView } from '$lib/data/journeyMap/journeyMap';

/** What people call the view at a route; the route itself when the version files no view there. */
export function viewNameAt(journeyMap: JourneyMap, route: string): string {
	const view = viewAtRoute(journeyMap, route);
	return view === undefined ? route : view.name;
}

/** The view a link names by its route, whatever its parameters are called and however they are written. */
export function viewOfShape(journeyMap: JourneyMap, route: string): MapView | undefined {
	const shape = routeShape(route);
	return journeyMap.views.find((view) => routeShape(view.route) === shape);
}

/** Whether a person arrives straight at the view at a route: sign in, a link in an email, the side bar. */
export function isEntryPoint(journeyMap: JourneyMap, route: string): boolean {
	return journeyMap.entryPoints.some((entryPoint) => entryPoint.route === route);
}

/** Whether one view links to another. */
export function isLinked(journeyMap: JourneyMap, fromRoute: string, toRoute: string): boolean {
	return journeyMap.links.some((link) => link.fromRoute === fromRoute && link.toRoute === toRoute);
}
