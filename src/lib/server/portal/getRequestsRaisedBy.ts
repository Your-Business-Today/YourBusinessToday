import { portalRequestsOf } from './getPortalRequests';
import { taskKinds } from '$lib/data/taskKind';
import type { PortalRequest } from '$lib/portal/portalRequest';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const requestColumns = 'id, title, details, status, resolution, created_at';
const messageColumns = 'id, task_id, body, created_at, author_account_id';
const answeredBy = 'YBT';
const newestFirst = { ascending: false };

/**
 * The requests one contact raised on one project, as the portal shows them, read with the service key
 * for the connector: the portal's surfaces know the contact only through their own sign-in.
 */
export async function getRequestsRaisedBy(
	service: SupabaseClient,
	accountId: string,
	projectId: string
): Promise<PortalRequest[]> {
	const { data, error } = await service
		.from('tasks')
		.select<string, Row>(requestColumns)
		.eq('kind', taskKinds.support)
		.eq('created_by', accountId)
		.eq('project_id', projectId)
		.order('created_at', newestFirst);
	if (error) throw error;
	const messages = await readMessages(
		service,
		data.map((row) => row.id as string)
	);
	return portalRequestsOf(
		data,
		messages.map((message) => asSeenBy(message, accountId))
	);
}

async function readMessages(service: SupabaseClient, taskIds: string[]): Promise<Row[]> {
	if (taskIds.length === 0) return [];
	const { data, error } = await service
		.from('conversation_messages')
		.select<string, Row>(messageColumns)
		.in('task_id', taskIds)
		.eq('is_internal', false)
		.order('created_at');
	if (error) throw error;
	return data;
}

function asSeenBy(message: Row, accountId: string): Row {
	const isFromVisitor = message.author_account_id === accountId;
	return {
		...message,
		is_from_visitor: isFromVisitor,
		author_name: isFromVisitor ? '' : answeredBy
	};
}
