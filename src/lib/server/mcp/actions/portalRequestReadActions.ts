import {
	clientContactOf,
	noProjectOfYourOrganisation,
	notAClientContact,
	projectOfYourOrganisation
} from '../clientContactAccess';
import { describePortalProjects, describePortalRequests } from './describePortalRequests';
import { getProjectsForClient } from '$lib/server/clients/getProjectsForClient';
import { getRequestsRaisedBy } from '$lib/server/portal/getRequestsRaisedBy';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

export const portalProjectIdField = textField('The project id, as given by list_portal_projects');

export const portalRequestReadActions: McpAction[] = [
	{
		name: 'list_portal_projects',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary: 'for a client contact: the projects YBT runs for your organisation',
		guidance:
			'This is what a client contact reaches, the same as on their portal. Start here, then ' +
			'raise a request on one of these projects or read where their requests stand.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const contact = await clientContactOf(caller);
			if (contact === null) return notAClientContact;
			return describePortalProjects(await getProjectsForClient(caller.supabase, contact.clientId));
		}
	},
	{
		name: 'list_portal_requests',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary: 'for a client contact: the requests you raised on one project and where each stands',
		guidance:
			'Shows each request with its state, its answer once there is one, and the last thing said. ' +
			'Reply on one with reply_to_portal_request when YBT has asked something.',
		inputSchema: objectSchema({ projectId: portalProjectIdField }, ['projectId']),
		run: async (caller, input) => {
			const contact = await clientContactOf(caller);
			if (contact === null) return notAClientContact;
			const project = await projectOfYourOrganisation(
				caller,
				contact,
				readText(input, 'projectId')
			);
			if (project === null) return noProjectOfYourOrganisation;
			const requests = await getRequestsRaisedBy(caller.supabase, caller.accountId, project.id);
			return describePortalRequests(project.name, requests);
		}
	}
];
