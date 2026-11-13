/** Where staff see an organisation's workflow map in the site. */
export function organisationWorkflowMapPath(organisationId: string): string {
	return `/organisations/${organisationId}/workflow-map`;
}
