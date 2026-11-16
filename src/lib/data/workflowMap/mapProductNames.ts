import { stationState, type MapStation } from './workflowMap';

/** What a product is called before it is a project and before the map says where its step is done. */
export const productNotNamedYet = 'A product not named yet';

/** Whether a station is done in one of our products or planned for one, rather than still done elsewhere. */
export function isInOurProducts(station: MapStation): boolean {
	return station.state !== stationState.elsewhere;
}

/** The product a station is in: its project's name, else where the map says it is done, else a product not named yet. */
export function productNameOf(station: MapStation, productNames: Record<string, string>): string {
	const projectName = station.productId === null ? undefined : productNames[station.productId];
	return projectName ?? station.doneIn ?? productNotNamedYet;
}
