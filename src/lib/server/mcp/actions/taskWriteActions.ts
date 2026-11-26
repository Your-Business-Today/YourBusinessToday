import { dayToDayDataRule } from '../ownerDoctrine';
import { objectSchema } from '../actionTypes';
import { createTaskFields } from './createTaskFields';
import { raiseTask, raisingAnswer } from './raiseTask';
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
			'when nothing matches. A top level development task is a feature or a bug (developmentKind). ' +
			'A bug — built, not working — is "FIX: <what is wrong>" and built before any feature: ask ' +
			'what was expected and what happened. A feature is a user story — give storyRole, ' +
			'storyWant and storyBenefit, and title it with the story. Subtasks are steps of a story and need none. A task is one ' +
			'session’s work: size it so one Claude session finishes it and ties it off. A feature larger than ' +
			'that is raised as one parent carrying the story with its chunks in subtasks, in the same call; ' +
			'a piece found later, of a bug or a feature, is a subtask (parentTaskId), never a new top level task. ' +
			'When a session stops short, the rest is raised as subtasks of the task, never left in prose or for a next ' +
			'chat. Put it under the goal it serves (goalId, from find_goals); rename a goal that has outgrown its title with update_goal. Give its department, which puts it on one of the project’s two sides: Development (development, ' +
			'infrastructure) or Internal work (administration, sales, marketing). A development task is built by ' +
			'Claude and ends in a pull request; a job a person does for the project — a cloud setting or secret, ' +
			'insurance, an account, a listing — is an infrastructure, administration, sales or marketing task, ' +
			'needs no story, and is assigned to them (add_task_assignees), every one of them when several must act. ' +
			'Anything the task needs someone to answer or confirm is posted, once it is raised, as a message waiting on ' +
			'each person who must answer (post_message with waitingOn), one per person: a question left only in the details ' +
			'notifies nobody and is never counted as theirs. ' + dayToDayDataRule + ' Never raise a task for what a person must give — an answer, a ' +
			'file, a setting — and never title one with a person’s name: that is a message waiting on ' +
			'them (post_message with waitingOn). Never raise a task, or an ask, to test what was built: it is done when it merges, and a fault is a new FIX. Without a department the task takes its goal’s, else development. Tasks titled ' +
			'"REFACTOR: round N" are raised by the deploy count, never by hand. When you raise it ' +
			'for someone else on the project — passed on in a message, a call or a chat — name them ' +
			'with requestedBy, so it is worked as their request. A series of steps done in order is a ' +
			'task sequence: raise one task per step, give each the step before it with waitsForTaskId, ' +
			'so it shows as a sequence. Files the task needs go on it ' +
			'with attach_file_to_task once it exists. Finished work with nothing left to build — research, a report, briefs — is never a task: ' +
			'keep it as project documents (add_project_document, or file_task_attachments_as_project_documents for files already on a task), ' +
			'and put any question about it to the person as a message. A development task raised here by staff starts ' +
			'with autocomplete on, and by anyone else off; set_task_autocomplete switches it. An ' +
			'infrastructure, administration, sales or marketing task is always off: a person does it. ' +
			'Before raising, check the request against the system’s design as the raising doctrine says: one that ' +
			'changes the design, or needs an infrastructure change or upgrade, a cost or a new dependency, is pushed ' +
			'back on first, and raised with designChange only when the person still wants it, so it waits on ' +
			'Requested for YBT’s approval before anything builds it or its subtasks.',
		inputSchema: objectSchema(createTaskFields, ['projectId', 'title']),
		run: async (caller, input) => raisingAnswer(await raiseTask(caller, input))
	}
];

