import { proseField, textField } from '../actionTypes';
import { taskKindOrder } from '$lib/data/taskKind';
import { requestedByField } from './requestedByField';
import { storyFields } from './storyFields';
import { raiseAnywayField } from './similarTaskCheck';
import { departmentField } from './departmentChoice';
import { developmentKindField } from './developmentKindField';
import { designChangeField } from './designChangeField';
import { subtasksField } from './subtasksField';

/** The fields create_task takes, which every action that raises a task the same way takes too. */
export const createTaskFields = {
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
	developmentKind: developmentKindField,
	requestedBy: requestedByField,
	raiseAnyway: raiseAnywayField,
	designChange: designChangeField,
	subtasks: subtasksField,
	...storyFields
};
