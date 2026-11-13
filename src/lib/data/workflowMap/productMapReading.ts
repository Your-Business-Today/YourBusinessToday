import type { OrganisationWorkflowMaps } from './organisationWorkflowMaps';

export const productMapReadings = {
	noOrganisation: 'noOrganisation',
	brainClosed: 'brainClosed',
	read: 'read'
} as const;

/** What a product's Workflow map tab found: no organisation it can show, a brain not open to the visitor, or the maps. */
export type ProductMapReading =
	| { kind: typeof productMapReadings.noOrganisation }
	| { kind: typeof productMapReadings.brainClosed; organisationName: string }
	| {
			kind: typeof productMapReadings.read;
			organisationId: string;
			organisationName: string;
			maps: OrganisationWorkflowMaps;
	  };
