import { reachableProject } from '../projectAccess';
import { createTask } from '$lib/server/projects/createTask';
import { newTaskSequenceRefusal } from '$lib/server/projects/newTaskSequenceRefusal';
import { newTaskStoryRefusal } from '$lib/server/projects/newTaskStoryRefusal';
import { noSuchProject } from './describeProject';
import { objectSchema, proseField, readOptionalText, readText, textField } from '../actionTypes';
import { parseTaskKind, taskKindOrder } from '$lib/data/taskKind';
import { readRequester, requestedByField } from './requestedByField';
import { readStory, storyFields } from './storyFields';
import type { McpAction } from '../actionTypes';

export const taskWriteActions: McpAction[] = [
	{
		name: 'create_task',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'add a task to a project, at the end of the backlog',
		guidance:
			'Search first: call find_tasks for the matter and work on the task you find. Raise one only ' +
			'when nothing matches. Every top level work task is a user story — give storyRole, ' +
			'storyWant and storyBenefit, and title it with the story — unless it is a bug, titled ' +
			'"FIX: <what is wrong>". Subtasks are steps of a story and need none. A task is one ' +
			'session’s work: size it so one Claude session finishes it and ties it off, and raise ' +
			'anything larger as tasks of that size. When a session stops short, the rest is raised ' +
			'here as tasks of its own — subtasks of the task, each assigned with set_task_assignees — ' +
			'never left in prose or for a next chat. Tasks titled ' +
			'"REFACTOR: round N" are raised by the deploy count, never by hand. When you raise it ' +
			'for someone else on the project — passed on in a message, a call or a chat — name them ' +
			'with requestedBy, so it is worked as their request. A series of steps done in order is a ' +
			'task sequence: raise one task per step, give each the step before it with waitsForTaskId, ' +
			'and assign each to whoever does it with set_task_assignees. Files the task needs go on it ' +
			'with attach_file_to_task once it exists.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project the task belongs to'),
				title: textField('What the task is called'),
				details: proseField('What the task involves'),
				dueDate: textField('When it is due, as YYYY-MM-DD'),
				goalId: textField('The goal it serves, as given by find_goals'),
				parentTaskId: textField('The task it is a subtask of'),
				waitsForTaskId: textField(
					'The task that must be done before this one can start — the step before it in a sequence'
				),
				kind: textField(
					`${taskKindOrder.join(' or ')} — work unless somebody is waiting on an answer`
				),
				requestedBy: requestedByField,
				...storyFields
			},
			['projectId', 'title']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const title = readOptionalText(input, 'title');
			if (title === null) return 'A task needs a title. Say what to call it and try again.';
			const requester = await readRequester(caller, project.id, input);
			if ('refusal' in requester) return requester.refusal;
			const seed = {
				title,
				details: readText(input, 'details'),
				dueDate: readOptionalText(input, 'dueDate'),
				parentTaskId: readOptionalText(input, 'parentTaskId'),
				waitsForTaskId: readOptionalText(input, 'waitsForTaskId'),
				goalId: readOptionalText(input, 'goalId'),
				kind: parseTaskKind(readText(input, 'kind')),
				story: readStory(input),
				requestedBy: requester.accountId
			};
			const storyRefusal = newTaskStoryRefusal(seed);
			if (storyRefusal !== null) return storyRefusal;
			const sequenceRefusal = await newTaskSequenceRefusal(caller.supabase, project.id, seed);
			if (sequenceRefusal !== null) return sequenceRefusal;
			const taskId = await createTask(caller.supabase, project.id, seed, caller.accountId);
			return `"${title}" added to ${project.name} (task id: ${taskId}).`;
		}
	}
];
