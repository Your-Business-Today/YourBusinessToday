import { conversationAccountIds } from '$lib/server/conversations/conversationAccountIds';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccountDirectory } from '$lib/server/accounts/getAccountDirectory';
import { getProject } from '$lib/server/projects/getProject';
import { getProjectGoals } from '$lib/server/goals/getProjectGoals';
import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { getTask } from '$lib/server/projects/getTask';
import { getTaskAcceptanceCriteria } from '$lib/server/projects/getTaskAcceptanceCriteria';
import { getTaskAttachments } from '$lib/server/projects/getTaskAttachments';
import { getTaskAssigneeMap } from '$lib/server/projects/getTaskAssigneeMap';
import { getTaskChecklists } from '$lib/server/projects/getTaskChecklists';
import { getTaskRoles } from '$lib/server/projects/getTaskRoles';
import { getTaskSequence } from '$lib/server/projects/getTaskSequence';
import { getConversationParticipantIds } from '$lib/server/conversations/getConversationParticipantIds';
import { getThread } from '$lib/server/conversations/getThread';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export async function loadTaskWorkspace(
	supabase: SupabaseClient,
	projectId: string,
	taskId: string
) {
	const [task, project] = await Promise.all([
		getTask(supabase, taskId),
		getProject(supabase, projectId)
	]);
	if (task === null || project === null) return null;
	const [
		people,
		goals,
		messages,
		participantIds,
		criteria,
		checklists,
		attachments,
		assigneeIdsByTask,
		roles,
		sequencePlace
	] = await Promise.all([
		getProjectPeople(supabase, projectId),
		getProjectGoals(supabase, projectId),
		getThread(supabase, { taskId }, true),
		getConversationParticipantIds(supabase, { taskId }),
		getTaskAcceptanceCriteria(supabase, taskId),
		getTaskChecklists(supabase, taskId),
		getTaskAttachments(supabase, taskId),
		getTaskAssigneeMap(supabase, taskIdsWithWaitedFor(task)),
		getTaskRoles(supabase, taskId),
		getTaskSequence(supabase, task)
	]);
	const authorIds = [task.createdBy, ...conversationAccountIds(messages)];
	return {
		task,
		project,
		people,
		goals,
		messages,
		participantIds,
		accounts: await getAccountDirectory(supabase, authorIds),
		criteria,
		checklists,
		attachments,
		assigneeIds: assigneeIdsByTask.get(taskId) ?? [],
		waitedForAssigneeIds: assigneeIdsByTask.get(task.waitsForTaskId ?? '') ?? [],
		roles,
		...sequencePlace
	};
}

function taskIdsWithWaitedFor(task: ProjectTask): string[] {
	if (task.waitsForTaskId === null) return [task.id];
	return [task.id, task.waitsForTaskId];
}
