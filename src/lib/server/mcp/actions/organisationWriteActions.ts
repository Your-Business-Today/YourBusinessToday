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

const nameTaken = 'An organisation of that name already sits there. Pick another name, or call list_organisations.';

const invoicingGuidance =
	'The address and the accounts contact are what invoices carry. A sub-organisation leaves blank ' +
	'whatever it shares with its parent and sets only what differs, so it is invoiced on its own.';

export const organisationWriteActions: McpAction[] = [
	{
		name: 'create_organisation',
		area: 'organisations',
		audience: 'staff',
		isWrite: true,
		summary: 'set up a new organisation — a client, or Your Business Today itself — with its invoicing details',
		guidance: invoicingGuidance + ' A business of an existing organisation is a sub-organisation: call create_sub_organisation instead.',
		inputSchema: objectSchema(organisationDetailsFields, ['name']),
		run: async (caller, input) => addOrganisation(caller, input, null)
	},
	{
		name: 'create_sub_organisation',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'add a business under an organisation you manage, so its projects can be invoiced and reached on their own',
		guidance:
			invoicingGuidance + ' Everyone on the parent reaches the sub-organisation’s projects; people added to ' +
			'the sub-organisation alone reach only those. A sub-organisation has no sub-organisations of its own.',
		inputSchema: objectSchema({ parentOrganisationId: organisationIdField, ...organisationDetailsFields }, ['parentOrganisationId', 'name']),
		run: async (caller, input) => {
			const parent = await manageableOrganisation(caller, readText(input, 'parentOrganisationId'));
			if (parent === null) return notAnOrganisationManager;
			if (parent.parentOrganisationId !== null) return `${parent.name} is itself a sub-organisation, so nothing sits under it.`;
			return addOrganisation(caller, input, parent.id);
		}
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

async function addOrganisation(
	caller: McpCaller,
	input: Record<string, unknown>,
	parentOrganisationId: string | null
): Promise<string> {
	const details = editedOrganisationDetails(input, noDetailsYet);
	const refusal = validateOrganisationDetails(details);
	if (refusal !== null) return refusal;
	const organisationId = await createOrganisation(caller.supabase, {
		details,
		parentOrganisationId,
		createdBy: caller.accountId
	});
	if (organisationId === null) return nameTaken;
	return `${details.name} created (id: ${organisationId}). Call invite_to_organisation to bring its people on.`;
}
