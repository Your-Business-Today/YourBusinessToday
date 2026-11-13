import type { StationState } from '$lib/data/workflowMap/workflowMap';

/** What a product's Workflow map tab says around the map, each a single line. */
export function productWorkflowMapMessages(productName: string, organisationName: string) {
	return {
		runsNoStation: `${productName} runs no station on ${organisationName}'s workflow map yet.`,
		mapLabel: `${organisationName}'s workflow map, with the stations ${productName} runs lit`
	};
}

export const noOrganisationMessage = 'This product belongs to no organisation you can see, so it has no workflow map to show.';

/** How the table names a station's state from the product's side. */
export const productStationStateNames: Record<StationState, string> = {
	ours: 'Live',
	planned: 'Planned',
	elsewhere: 'Done elsewhere'
};

export const productStationColumns = {
	station: 'Station in this product',
	role: 'Role',
	takesIn: 'Takes in',
	produces: 'Produces',
	state: 'State'
} as const;
