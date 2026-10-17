import {
	clientContactsOf,
	noProjectOfYourOrganisation,
	notAClientContact,
	projectOfYourOrganisation
} from '../clientContactAccess';
import { describePortalProjects, describePortalRequests } from './describePortalRequests';
import { getProjectsForClients } from '$lib/server/clients/getProjectsForClient';
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
		summary: 'for a client contact: the projects YBT runs for your organisations',
		guidance:
			'This is what a client contact reaches, the same as on their portal. Start here, then ' +
			'raise a request on one of these projects or read where their requests stand.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const contacts = await clientContactsOf(caller);
			if (contacts.length === 0) return notAClientContact;
			const clientIds = contacts.map((contact) => contact.clientId);
			const projects = await getProjectsForClients(caller.supabase, clientIds);
			return describePortalProjects(projects);
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
			const contacts = await clientContactsOf(caller);
			if (contacts.length === 0) return notAClientContact;
			const reached = await projectOfYourOrganisation(
				caller,
				contacts,
				readText(input, 'projectId')
			);
			if (reached === null) return noProjectOfYourOrganisation;
			const { project } = reached;
			const requests = await getRequestsRaisedBy(caller.supabase, caller.accountId, project.id);
			return describePortalRequests(project.name, requests);
		}
	}
];
