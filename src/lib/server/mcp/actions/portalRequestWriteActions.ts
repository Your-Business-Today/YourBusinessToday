import { inputValues, isRefusal } from '$lib/server/portal/portalFormReading';
import { raisePortalRequest } from '$lib/server/portal/raisePortalRequest';
import { replyAsClientContact } from './replyAsClientContact';
import {
	validatePortalReply,
	validatePortalRequest
} from '$lib/server/portal/validatePortalRequest';
import {
	clientContactsOf,
	noProjectOfYourOrganisation,
	notAClientContact,
	projectOfYourOrganisation
} from '../clientContactAccess';
import { objectSchema, readText, textField } from '../actionTypes';
import { portalProjectIdField } from './portalRequestReadActions';
import type { McpAction } from '../actionTypes';

export const portalRequestWriteActions: McpAction[] = [
	{
		name: 'raise_portal_request',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: "for a client contact: raise a request on one of your organisations' projects",
		guidance:
			'Read list_portal_requests first: if an open request already covers it, reply there instead. ' +
			'Ask the person before you raise it. One matter per request, in their words, with why it matters.',
		inputSchema: objectSchema(
			{
				projectId: portalProjectIdField,
				title: textField('What is needed, in one sentence'),
				want: textField('What is needed, in their own words'),
				benefit: textField('Why it matters')
			},
			['projectId', 'title', 'want']
		),
		run: async (caller, input) => {
			const contacts = await clientContactsOf(caller);
			if (contacts.length === 0) return notAClientContact;
			const seed = validatePortalRequest(inputValues(input));
			if (isRefusal(seed)) return seed.refusal;
			const reached = await projectOfYourOrganisation(
				caller,
				contacts,
				readText(input, 'projectId')
			);
			if (reached === null) return noProjectOfYourOrganisation;
			const { project, contact } = reached;
			const raised = await raisePortalRequest(caller.accountId, project.id, seed, contact.role);
			if (isRefusal(raised)) return raised.refusal;
			return `Raised "${seed.title}" on ${project.name} (task id: ${raised.taskId}). The answer arrives on it.`;
		}
	},
	{
		name: 'reply_to_portal_request',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: 'for a client contact: reply on one of the requests you raised',
		guidance: 'Post what the person said, in their words, when YBT has asked them something.',
		inputSchema: objectSchema(
			{
				taskId: textField("The request's task id, as given by list_portal_requests"),
				body: textField('The reply')
			},
			['taskId', 'body']
		),
		run: async (caller, input) => {
			const contacts = await clientContactsOf(caller);
			if (contacts.length === 0) return notAClientContact;
			const reply = validatePortalReply(inputValues(input));
			if (isRefusal(reply)) return reply.refusal;
			return replyAsClientContact(caller, contacts, reply);
		}
	}
];
