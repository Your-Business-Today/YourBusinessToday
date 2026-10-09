import { conversationAccountIds } from '$lib/server/conversations/conversationAccountIds';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getProject } from '$lib/server/projects/getProject';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTask } from '$lib/server/projects/getTask';
import { getTaskAcceptanceCriteria } from '$lib/server/projects/getTaskAcceptanceCriteria';
import { getTaskAttachments } from '$lib/server/projects/getTaskAttachments';
import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
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
	const { assigneeIdsByTask, sequencePlace, ...records } = await loadTaskRecords(supabase, task);
	const authorIds = [task.createdBy, ...conversationAccountIds(records.messages)];
	return {
		task,
		project,
		...records,
		accounts: await getAccountsById(supabase, authorIds),
		assigneeIds: assigneeIdsByTask.get(taskId) ?? [],
		waitedForAssigneeIds: assigneeIdsByTask.get(task.waitsForTaskId ?? '') ?? [],
		...sequencePlace
	};
}

async function loadTaskRecords(supabase: SupabaseClient, task: ProjectTask) {
	const [projectRecords, conversationRecords, planRecords] = await Promise.all([
		loadProjectRecords(supabase, task.projectId),
		loadConversationRecords(supabase, task.id),
		loadPlanRecords(supabase, task)
	]);
	return { ...projectRecords, ...conversationRecords, ...planRecords };
}

async function loadProjectRecords(supabase: SupabaseClient, projectId: string) {
	const [people, goals] = await Promise.all([
		getPeopleOnProject(supabase, projectId),
		getGoalsForProject(supabase, projectId)
	]);
	return { people, goals };
}

async function loadConversationRecords(supabase: SupabaseClient, taskId: string) {
	const [messages, participantIds] = await Promise.all([
		getThread(supabase, { taskId }, true),
		getConversationParticipantIds(supabase, { taskId })
	]);
	return { messages, participantIds };
}

async function loadPlanRecords(supabase: SupabaseClient, task: ProjectTask) {
	const taskId = task.id;
	const [criteria, checklists, attachments, assigneeIdsByTask, roles, sequencePlace] = await Promise.all([
		getTaskAcceptanceCriteria(supabase, taskId),
		getTaskChecklists(supabase, taskId),
		getTaskAttachments(supabase, taskId),
		getAssigneeIdsByTask(supabase, taskIdsWithWaitedFor(task)),
		getTaskRoles(supabase, taskId),
		getTaskSequence(supabase, task)
	]);
	return { criteria, checklists, attachments, assigneeIdsByTask, roles, sequencePlace };
}

function taskIdsWithWaitedFor(task: ProjectTask): string[] {
	if (task.waitsForTaskId === null) return [task.id];
	return [task.id, task.waitsForTaskId];
}
