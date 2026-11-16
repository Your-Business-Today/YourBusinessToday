import { validateRecordId } from '$lib/data/isUuid';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { openLeadOrganisation, type OpenedLeadOrganisation } from '$lib/server/onboarding/openLeadOrganisation';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const leadOrganisationGuidance =
	'A lead can have its own organisation before it signs, so its domain and workflow map can be built and shown at ' +
	'the first meeting. This gives back the organisation already linked to the company, else links the one carrying ' +
	"the company's exact name, else makes one in its name, and switches Your Business Brain on for it. It invites " +
	'nobody, sends no email and makes no project. Setting the client up later carries on from the same organisation.';

export const leadOrganisationActions: McpAction[] = [
	{
		name: 'open_lead_organisation',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "give a lead on the register its own organisation, inviting nobody, so its domain and workflow map can be built before it signs",
		guidance: leadOrganisationGuidance,
		inputSchema: objectSchema(
			{
				clientId: textField('The lead, as list_clients gives its id'),
				organisationId: textField(
					"An organisation linked to nothing yet to link instead, as list_organisations gives its id. Leave it out to match one by the company's exact name"
				)
			},
			['clientId']
		),
		run: async (caller, input) => openOrganisationOfLead(caller, input)
	}
];

async function openOrganisationOfLead(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const organisationId = readOptionalText(input, 'organisationId') ?? null;
	const refusal = validateRecordId('clientId', clientId) ?? validateOptionalRecordId('organisationId', organisationId);
	if (refusal !== null) return refusal;
	const opened = await openLeadOrganisation({ clientId, organisationId, actorAccountId: caller.accountId });
	if (isRefusal(opened)) return opened.refusal;
	return describeOpenedLeadOrganisation(opened);
}

function validateOptionalRecordId(fieldName: string, candidate: string | null): string | null {
	if (candidate === null) return null;
	return validateRecordId(fieldName, candidate);
}

export function describeOpenedLeadOrganisation({ companyName, organisation, opening }: OpenedLeadOrganisation): string {
	return [
		`${companyName}'s organisation is ${organisation.name} (id ${organisation.id}), ${opening}. Your Business Brain is on for it. Nobody was invited.`,
		`Next: file_business_brain_domain with organisationId ${organisation.id} for its domain, then file_workflow_map and read_workflow_map with the same organisationId for its workflow map.`
	].join('\n');
}
