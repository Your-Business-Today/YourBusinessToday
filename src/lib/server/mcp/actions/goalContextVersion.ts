import { findConfirmedVersion } from '$lib/server/companyContext/findConfirmedVersion';
import { readOptionalText, textField } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

export const contextVersionIdField = textField(
	"Staff only: the confirmed company context a service goal comes from, as read_confirmed_company_context gives it — leave out for any other goal"
);

/** The confirmed version a goal is raised from, none for a goal raised any other way, or why it cannot be linked. */
export type GoalContextLink = { contextVersionId?: string; versionNumber?: number } | { refusal: string };

export const onlyStaffRaiseServices = "Only YBT staff raise services from a client's confirmed company context.";
export const noSuchConfirmedVersion =
	'No confirmed company context has that contextVersionId: read_confirmed_company_context gives it.';
export const anotherOrganisationsContext =
	"That confirmed context is another organisation's: raise its services on a project under the same organisation.";

export async function readGoalContextLink(
	caller: McpCaller,
	project: Project,
	input: Record<string, unknown>
): Promise<GoalContextLink> {
	const versionId = readOptionalText(input, 'contextVersionId');
	if (versionId === null) return {};
	if (!caller.isStaff) return { refusal: onlyStaffRaiseServices };
	const idRefusal = validateRecordId('contextVersionId', versionId);
	if (idRefusal !== null) return { refusal: idRefusal };
	const version = await findConfirmedVersion(caller.supabase, versionId);
	if (version === null) return { refusal: noSuchConfirmedVersion };
	if (version.organisationId !== project.organisationId) return { refusal: anotherOrganisationsContext };
	return { contextVersionId: version.id, versionNumber: version.versionNumber };
}

export function isContextLinkRefused(link: GoalContextLink): link is { refusal: string } {
	return 'refusal' in link;
}

/** Said after the goal is raised, when it is a service from the confirmed context. */
export function contextLinkSentence(link: GoalContextLink): string {
	if (isContextLinkRefused(link) || link.versionNumber === undefined) return '';
	return ` It is a service from version ${link.versionNumber} of the client's confirmed company context, and links back to it.`;
}
