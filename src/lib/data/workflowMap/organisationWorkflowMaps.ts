import type { WorkflowMapVersion } from './workflowMap';

/** An organisation's latest Before and After, either missing until it is filed, and the names of the products they name. */
export type OrganisationWorkflowMaps = {
	before: WorkflowMapVersion | null;
	after: WorkflowMapVersion | null;
	productNames: Record<string, string>;
};
