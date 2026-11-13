import { findConfirmedMapVersion } from '$lib/server/workflowMap/readConfirmedMapVersions';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { readOptionalText, textField } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { MapConfirmation } from '$lib/data/workflowMap/mapConfirmed';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

export const workflowMapVersionIdField = textField(
	'Staff only: the confirmed workflow map a service goal comes from, as read_confirmed_workflow_map gives it — leave out for any other goal'
);

/** The confirmed map version a goal is raised from, none for a goal raised any other way, or why it cannot be linked. */
export type GoalMapLink = { workflowMapVersionId?: string; confirmed?: MapConfirmation } | { refusal: string };

export const onlyStaffRaiseMapServices = "Only YBT staff raise services from a client's confirmed workflow map.";
export const noSuchConfirmedMap =
	'No confirmed workflow map has that workflowMapVersionId: read_confirmed_workflow_map gives it.';
export const anotherOrganisationsMap =
	"That confirmed workflow map is another organisation's: raise its services on a project under the same organisation.";

export async function readGoalMapLink(caller: McpCaller, project: Project, input: Record<string, unknown>): Promise<GoalMapLink> {
	const versionId = readOptionalText(input, 'workflowMapVersionId');
	if (versionId === null) return {};
	if (!caller.isStaff) return { refusal: onlyStaffRaiseMapServices };
	const idRefusal = validateRecordId('workflowMapVersionId', versionId);
	if (idRefusal !== null) return { refusal: idRefusal };
	const version = await findConfirmedMapVersion(caller.supabase, versionId);
	if (version === null) return { refusal: noSuchConfirmedMap };
	if (version.organisationId !== project.organisationId) return { refusal: anotherOrganisationsMap };
	return { workflowMapVersionId: version.id, confirmed: version };
}

export function isMapLinkRefused(link: GoalMapLink): link is { refusal: string } {
	return 'refusal' in link;
}

/** Said after the goal is raised, when it is a service from the confirmed map. */
export function mapLinkSentence(link: GoalMapLink): string {
	if (isMapLinkRefused(link) || link.confirmed === undefined) return '';
	const { stage, versionNumber } = link.confirmed;
	const version = `${mapStageNames[stage]} version ${versionNumber}`;
	return ` It is a service from the ${version} of the client's confirmed workflow map, and links back to it.`;
}
