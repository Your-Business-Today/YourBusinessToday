import { getTask } from '$lib/server/projects/getTask';
import { postMessage } from '$lib/server/conversations/postMessage';
import { projectOfYourOrganisation } from '../clientContactAccess';
import { supportTaskKind } from '$lib/data/taskKind';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { McpCaller } from '../resolveMcpCaller';
import type { PortalReply } from '$lib/server/portal/validatePortalRequest';

const notYourRequest = 'That is not one of your requests. Call list_portal_requests for them.';

/** Posts the reply on a request the contact raised on one of their organisations' projects. */
export async function replyAsClientContact(
	caller: McpCaller,
	contacts: ClientContact[],
	reply: PortalReply
): Promise<string> {
	const task = await getTask(caller.supabase, reply.taskId);
	if (task === null || task.kind !== supportTaskKind || task.createdBy !== caller.accountId)
		return notYourRequest;
	const reached = await projectOfYourOrganisation(caller, contacts, task.projectId);
	if (reached === null) return notYourRequest;
	await postMessage(caller.supabase, { taskId: task.id }, caller.accountId, reply.body);
	return `Replied on "${task.title}".`;
}
