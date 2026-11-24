import { readOptionalText, textField } from '../actionTypes';
import { organisationHolder, productHolder, type BrandHolder } from '$lib/server/brandKits/brandHolder';
import { reachableProject } from '../projectAccess';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const productProjectIdField = textField(
	'The organisation’s project whose own brand this is, for a product with a look of its own, as list_projects gives it — ' +
		'leave out for the organisation’s brand. A product’s brand is read over its organisation’s: whatever it leaves undecided is the organisation’s.'
);

export function notAProjectOf(organisationName: string): string {
	return `No project you are on belongs to ${organisationName} with that id. Call list_projects for yours; read_project names each one's organisation.`;
}

/** The brand the input names: the organisation's own, or one of its products' when a projectId is given. */
export async function brandHolderOfInput(
	caller: McpCaller,
	input: Record<string, unknown>,
	organisation: Organisation
): Promise<BrandHolder | { refusal: string }> {
	const projectId = readOptionalText(input, 'projectId');
	if (projectId === null) return organisationHolder(organisation);
	const project = await reachableProject(caller, projectId);
	const isTheOrganisationsProject = project !== null && project.organisationId === organisation.id;
	if (!isTheOrganisationsProject) return { refusal: notAProjectOf(organisation.name) };
	return productHolder(organisation, project);
}
