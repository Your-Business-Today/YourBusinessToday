import { createOrganisation } from '$lib/server/organisations/createOrganisation';
import { manageableOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { objectSchema, readText } from '../actionTypes';
import {
	noDetailsYet,
	organisationDetailsFields,
	organisationIdField,
	editedOrganisationDetails
} from './organisationDetailsFields';
import { updateOrganisationDetails } from '$lib/server/organisations/updateOrganisationDetails';
import { validateOrganisationDetails } from '$lib/data/organisationRules';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const nameTaken = 'An organisation of that name already exists. Pick another name, or call list_organisations.';

const invoicingGuidance =
	'The address and the accounts contact are what invoices carry. Every organisation is one company and is ' +
	'invoiced as itself, so each holds its own details.';

export const organisationWriteActions: McpAction[] = [
	{
		name: 'create_organisation',
		area: 'organisations',
		audience: 'staff',
		isWrite: true,
		summary: 'set up a new organisation — a client, or Your Business Today itself — with its invoicing details',
		guidance: invoicingGuidance,
		inputSchema: objectSchema(organisationDetailsFields, ['name']),
		run: async (caller, input) => addOrganisation(caller, input)
	},
	{
		name: 'update_organisation_details',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'rename an organisation you manage, or change its address or accounts contact',
		guidance: invoicingGuidance,
		inputSchema: objectSchema({ organisationId: organisationIdField, ...organisationDetailsFields }, ['organisationId']),
		run: async (caller, input) => {
			const organisation = await manageableOrganisation(caller, readText(input, 'organisationId'));
			if (organisation === null) return notAnOrganisationManager;
			const details = editedOrganisationDetails(input, organisation);
			const refusal = validateOrganisationDetails(details);
			if (refusal !== null) return refusal;
			await updateOrganisationDetails(caller.supabase, organisation.id, details);
			return `${details.name} saved.`;
		}
	}
];

async function addOrganisation(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const details = editedOrganisationDetails(input, noDetailsYet);
	const refusal = validateOrganisationDetails(details);
	if (refusal !== null) return refusal;
	const organisationId = await createOrganisation(caller.supabase, { details, createdBy: caller.accountId });
	if (organisationId === null) return nameTaken;
	return `${details.name} created (id: ${organisationId}). Call invite_to_organisation to bring its people on.`;
}
