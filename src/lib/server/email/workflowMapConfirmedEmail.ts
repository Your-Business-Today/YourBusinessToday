import { escapeHtml } from '$lib/data/escapeHtml';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { renderInviteEmail } from './inviteEmailShell';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';

/** Which client confirmed which version of which map, and where staff open it. */
export type ConfirmedWorkflowMap = { organisationName: string; stage: MapStage; versionNumber: number; mapUrl: string };

export function workflowMapConfirmedSubject({ organisationName, stage }: ConfirmedWorkflowMap): string {
	return `${organisationName} confirmed their ${mapStageNames[stage]} workflow map`;
}

/** Tells staff a client has confirmed their workflow map, so the services can be raised from it as goals. */
export function renderWorkflowMapConfirmedEmail(confirmed: ConfirmedWorkflowMap): string {
	const heading = escapeHtml(workflowMapConfirmedSubject(confirmed));
	const body =
		`They confirmed version ${confirmed.versionNumber} on their portal as right. Next, a staff member's Claude reads ` +
		'it with read_confirmed_workflow_map and raises the services we build from it as goals on their project, where ' +
		'they follow them.';
	return renderInviteEmail(heading, body, confirmed.mapUrl, 'Open their workflow map');
}
