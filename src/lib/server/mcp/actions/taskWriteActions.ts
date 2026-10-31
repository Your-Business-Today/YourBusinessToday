import { reachableProject } from '../projectAccess';
import { createTask } from '$lib/server/projects/createTask';
import { newTaskRefusal } from '$lib/server/projects/newTaskRefusal';
import { noSuchProject } from './describeProject';
import { objectSchema, proseField, readOptionalText, readText, textField } from '../actionTypes';
import { taskKindOrder } from '$lib/data/taskKind';
import { readConnectorTaskSeed } from './connectorTaskSeed';
import { autocompleteWord, isTaskAutocomplete } from '$lib/data/autocomplete';
import { withRaiserAutocomplete } from '$lib/data/autocompleteStanding';
import { readRequester, requestedByField } from './requestedByField';
import { storyFields } from './storyFields';
import { similarTasksRefusal } from './similarTasksRefusal';
import { raiseAnywayField } from './similarTaskCheck';
import { chooseTaskDepartment, departmentField, isDepartmentRefused } from './departmentChoice';
import { isPersonLedTitle, personLedTitleRefusal } from '$lib/data/personLedTitle';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
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
			'when nothing matches. Every top level development task is a user story — give storyRole, ' +
			'storyWant and storyBenefit, and title it with the story — unless it is a bug, titled ' +
			'"FIX: <what is wrong>". Subtasks are steps of a story and need none. A task is one ' +
			'session’s work: size it so one Claude session finishes it and ties it off, and raise ' +
			'anything larger as tasks of that size. When a session stops short, the rest is raised ' +
			'here as tasks of its own — subtasks of the task — never left in prose or for a next ' +
			'chat. Give its department: a development task is built by Claude and ends in a pull ' +
			'request; a job a person does for the project — insurance, an account, a listing — is ' +
			'an administration, sales or marketing task, needs no story, and is assigned to them ' +
			'(set_task_assignees). Never raise a task for what a person must give — an answer, a ' +
			'file, a test — and never title one with a person’s name: that is a message waiting on ' +
			'them (post_message with waitingOn). Without a department the task takes its goal’s, ' +
			'else development. Tasks titled ' +
			'"REFACTOR: round N" are raised by the deploy count, never by hand. When you raise it ' +
			'for someone else on the project — passed on in a message, a call or a chat — name them ' +
			'with requestedBy, so it is worked as their request. A series of steps done in order is a ' +
			'task sequence: raise one task per step, give each the step before it with waitsForTaskId, ' +
			'so it shows as a sequence. Files the task needs go on it ' +
			'with attach_file_to_task once it exists. A development task raised here by staff starts ' +
			'with autocomplete on, and by anyone else off; set_task_autocomplete switches it. An ' +
			'administration, sales or marketing task is always off: a person does it.',
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
				department: departmentField,
				requestedBy: requestedByField,
				raiseAnyway: raiseAnywayField,
				...storyFields
			},
			['projectId', 'title']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const title = readOptionalText(input, 'title');
			if (title === null) return 'A task needs a title. Say what to call it and try again.';
			const people = await getPeopleOnProject(caller.supabase, project.id);
			if (isPersonLedTitle(title, people)) return personLedTitleRefusal;
			const requester = await readRequester(caller, project.id, input);
			if ('refusal' in requester) return requester.refusal;
			const department = await chooseTaskDepartment(caller, input);
			if (isDepartmentRefused(department)) return department.refusal;
			const raised = readConnectorTaskSeed(input, title, requester.accountId);
			const seed = withRaiserAutocomplete({ ...raised, department }, caller.isStaff);
			const refusal = await newTaskRefusal(caller.supabase, project.id, seed);
			if (refusal !== null) return refusal;
			const similarRefusal = await similarTasksRefusal(caller, project, seed, input.raiseAnyway);
			if (similarRefusal !== null) return similarRefusal;
			const taskId = await createTask(caller.supabase, project.id, seed, caller.accountId);
			const autocomplete = autocompleteWord(isTaskAutocomplete(seed.autocomplete ?? null, null));
			return `"${title}" added to ${project.name} with autocomplete ${autocomplete} (task id: ${taskId}).`;
		}
	}
];

