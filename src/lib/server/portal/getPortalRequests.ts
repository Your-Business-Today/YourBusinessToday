import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { isTaskDone, parseTaskStatus } from '$lib/data/taskStatus';
import { portalTaskStatusLabel } from '$lib/portal/portalTaskStatus';
import { taskKinds } from '$lib/data/taskKind';
import type { PortalRequest, PortalRequestMessage } from '$lib/portal/portalRequest';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const requestColumns = 'id, title, details, status, resolution, created_at';
const messageColumns = 'id, task_id, body, created_at, author_name, is_from_visitor';
const newestFirst = { ascending: false };

/** The requests the signed-in contact raised on one project, newest first, each with its conversation. */
export async function getPortalRequests(supabase: SupabaseClient, projectId: string): Promise<PortalRequest[]> {
	const { data, error } = await supabase
		.from('portal_requests')
		.select<string, Row>(requestColumns)
		.eq('project_id', projectId)
		.order('created_at', newestFirst);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	const messages = await readMessages(supabase, data.map((row) => row.id as string));
	return portalRequestsOf(data, messages);
}

export function portalRequestsOf(requestRows: Row[], messageRows: Row[]): PortalRequest[] {
	return requestRows.map((row) => requestOf(row, messageRows));
}

/** Whether the signed-in contact raised this request, read on their own account. */
export async function isOwnPortalRequest(supabase: SupabaseClient, taskId: string): Promise<boolean> {
	const { data, error } = await supabase.from('portal_requests').select('id').eq('id', taskId).maybeSingle();
	if (error) throw error;
	return data !== null;
}

async function readMessages(supabase: SupabaseClient, taskIds: string[]): Promise<Row[]> {
	if (taskIds.length === 0) return [];
	const { data, error } = await supabase
		.from('portal_request_messages')
		.select<string, Row>(messageColumns)
		.in('task_id', taskIds)
		.order('created_at');
	if (error) throw error;
	return data;
}

function requestOf(row: Row, messages: Row[]): PortalRequest {
	const status = parseTaskStatus(row.status);
	return {
		id: row.id as string,
		title: row.title as string,
		details: (row.details as string) ?? '',
		statusLabel: portalTaskStatusLabel(taskKinds.support, status),
		isDone: isTaskDone(status),
		resolution: (row.resolution as string) ?? '',
		createdAt: row.created_at as string,
		messages: messages.filter((message) => message.task_id === row.id).map(messageOf)
	};
}

function messageOf(row: Row): PortalRequestMessage {
	return {
		id: row.id as string,
		body: row.body as string,
		createdAt: row.created_at as string,
		authorName: row.author_name as string,
		isFromVisitor: row.is_from_visitor === true
	};
}
