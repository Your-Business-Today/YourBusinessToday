import { objectSchema, textField } from '../actionTypes';
import { todoFields, todoPlaceFields } from '$lib/server/todos/todoConnectorFields';
import { dayToDayDataRule } from '../ownerDoctrine';
import { createTaskFields } from './createTaskFields';
import { filedEmailDirections } from '$lib/data/filedEmailRules';
import { emailContentFields, emailMessageFields } from './filedEmailFields';
import { addTodoFromEmail, raiseTaskFromEmail } from './raiseFromEmail';
import type { McpAction } from '../actionTypes';

const keptAsSource =
	'The email is filed against what is raised, so whoever picks it up can open it in Gmail, and under the sender’s ' +
	'client or lead too when find_records_for_email knows them as one. Keep a short summary of what it asks for: never ' +
	'copy its body and never keep anything personal. Give the Gmail ids exactly as the Gmail connector gives them.';

const raisingGuidance =
	'Raise the work an email asks for. Call find_tasks first: when an open task already covers it, file the email with ' +
	'file_email_to_client and post on that task instead. When the sender is the client whose project it is, it is ' +
	'raised as a support request on that project and answered in its conversation; otherwise it is a task, raised ' +
	'exactly as create_task raises one, so give what create_task needs. ' + keptAsSource;

const todoGuidance =
	'Put a job an email asks of someone on their own to-do list, with the email named in its notes: a reply to send, ' +
	'a small company job no task waits on. ' + dayToDayDataRule + ' Work for a project is raise_task_from_email. ' +
	keptAsSource;

const emailFields = {
	...emailMessageFields,
	direction: textField(`One of ${filedEmailDirections.join(', ')}`),
	...emailContentFields
};
const requiredEmailFields = ['mailbox', 'messageId', 'threadId', 'direction', 'from', 'sentAt', 'summary'];

export const emailPathwayActions: McpAction[] = [
	{
		name: 'raise_task_from_email',
		area: 'tasks',
		audience: 'staff',
		isWrite: true,
		summary: 'raise a task, or a support request on the sender’s own project, from an email in a Gmail inbox, with the email kept as its source',
		guidance: raisingGuidance,
		inputSchema: objectSchema({ ...createTaskFields, ...emailFields }, ['projectId', 'title', ...requiredEmailFields]),
		run: async (caller, input) => raiseTaskFromEmail(caller, input)
	},
	{
		name: 'add_todo_from_email',
		area: 'tasks',
		audience: 'staff',
		isWrite: true,
		summary: 'put a to-do on someone’s own list from an email in a Gmail inbox, its notes naming the email, with the email kept as its source',
		guidance: todoGuidance,
		inputSchema: objectSchema({ ...todoFields, ...todoPlaceFields, ...emailFields }, ['title', ...requiredEmailFields]),
		run: async (caller, input) => addTodoFromEmail(caller, input)
	}
];
