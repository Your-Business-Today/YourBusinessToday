import { createOrganisation } from '$lib/server/organisations/createOrganisation';
import { deleteOrganisation } from '$lib/server/organisations/deleteOrganisation';
import { manageableOrganisation, noSuchOrganisation, notAnOrganisationManager, reachableOrganisation } from '../organisationAccess';
import { objectSchema, readText } from '../actionTypes';
import { organisationDetailsAfter, organisationDetailsFields, organisationIdField } from './organisationDetailsFields';
import { updateOrganisationDetails } from '$lib/server/organisations/updateOrganisationDetails';
import { blankOrganisationDetails, validateOrganisationDetails } from '$lib/data/organisationRules';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const nameTaken = 'An organisation of that name already exists. Pick another name, or call list_organisations.';

const detailsGuidance =
	'The details are what we must hold about a client we sign up: the company as it is registered, where its ' +
	'invoices go, who signs the contract and where notices are sent, and who answers for the personal data we ' +
	'process for it. Every organisation is one company and is invoiced as itself, so each holds its own details.';

const deletionGuidance =
	'Deleting is for an organisation set up by mistake or never signed. Its projects stay, under no organisation, ' +
	'and the project memberships it granted go with it. One still holding records that are always kept — its books, ' +
	'its Your Business Brain or the directors named to its board — is refused and kept.';

export const organisationWriteActions: McpAction[] = [
	{
		name: 'create_organisation',
		area: 'organisations',
		audience: 'staff',
		isWrite: true,
		summary: 'set up a new organisation — a client, or Your Business Today itself — with the details we hold about it',
		guidance: detailsGuidance,
		inputSchema: objectSchema(organisationDetailsFields, ['name']),
		run: async (caller, input) => addOrganisation(caller, input)
	},
	{
		name: 'update_organisation_details',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'rename an organisation you manage, or change its company, invoicing, contract or data protection details',
		guidance: detailsGuidance,
		inputSchema: objectSchema({ organisationId: organisationIdField, ...organisationDetailsFields }, ['organisationId']),
		run: async (caller, input) => {
			const organisation = await manageableOrganisation(caller, readText(input, 'organisationId'));
			if (organisation === null) return notAnOrganisationManager;
			const details = organisationDetailsAfter(input, organisation);
			const refusal = validateOrganisationDetails(details);
			if (refusal !== null) return refusal;
			await updateOrganisationDetails(caller.supabase, organisation.id, details);
			return `${details.name} saved.`;
		}
	},
	{
		name: 'delete_organisation',
		area: 'organisations',
		audience: 'staff',
		isWrite: true,
		summary: 'delete an organisation outright, as its page does — refused while it still holds records that are always kept',
		guidance: deletionGuidance,
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => removeOrganisation(caller, readText(input, 'organisationId'))
	}
];

async function removeOrganisation(caller: McpCaller, organisationId: string): Promise<string> {
	const idRefusal = validateRecordId('organisationId', organisationId);
	if (idRefusal !== null) return idRefusal;
	const organisation = await reachableOrganisation(caller, organisationId);
	if (organisation === null) return noSuchOrganisation;
	const refusal = await deleteOrganisation(caller.supabase, organisation.id);
	if (refusal !== null) return refusal;
	return `${organisation.name} deleted. Its projects stay, under no organisation.`;
}

async function addOrganisation(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const details = organisationDetailsAfter(input, blankOrganisationDetails);
	const refusal = validateOrganisationDetails(details);
	if (refusal !== null) return refusal;
	const organisationId = await createOrganisation(caller.supabase, { details, createdBy: caller.accountId });
	if (organisationId === null) return nameTaken;
	return `${details.name} created (id: ${organisationId}). Call invite_to_organisation to bring its people on.`;
}
