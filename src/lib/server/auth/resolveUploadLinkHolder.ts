import { reachableTask } from '$lib/server/mcp/projectAccess';
import { readTaskUploadLink, type TaskUploadLink } from '$lib/server/projects/taskUploadLink';
import { resolveAccountStanding } from '$lib/server/mcp/resolveAccountStanding';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { uploadLinkSigningKey } from '$lib/server/projects/uploadLinkSigningKey';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type UploadLinkHolder = { caller: McpCaller; task: ProjectTask; link: TaskUploadLink };

/**
 * Whoever holds an upload link acts as the person it was made for, on its one task — for as long
 * as the link lives, their account stands, and they are still on the task's project.
 */
export async function resolveUploadLinkHolder(token: string): Promise<UploadLinkHolder | null> {
	const link = readTaskUploadLink(token, uploadLinkSigningKey(), new Date());
	if (link === null) return null;
	const supabase = supabaseServiceClient();
	const standing = await resolveAccountStanding(supabase, link.grantedTo);
	if (standing === null) return null;
	const caller = { ...standing, supabase };
	const task = await reachableTask(caller, link.taskId);
	if (task === null) return null;
	return { caller, task, link };
}
