import { gmailThreadLink, type EmailFacts } from '$lib/data/filedEmailRules';
import { validateEmailFacts } from '$lib/server/filedEmails/validateEmailFacts';
import { findEmailSender, isSentByClient, type EmailSender } from '$lib/server/filedEmails/findEmailSender';
import { fileEmailFromSender } from '$lib/server/filedEmails/fileEmailFromSender';
import { reachableProject } from '../projectAccess';
import { readOptionalText, readText } from '../actionTypes';
import { noSuchProject } from './describeProject';
import { raiseTask, type RaisedTask } from './raiseTask';
import { raiseSupportTask } from './raiseSupportTask';
import { addTodoFromInput } from './addTodoFromInput';
import { todoLine } from './describeTodos';
import type { Project } from '$lib/server/projects/projectRecord';
import type { McpCaller } from '../resolveMcpCaller';

/** Raises what an email asks for: a support request when the sender is the client whose project it is, else a task; the email is kept as its source. */
export async function raiseTaskFromEmail(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const facts = validateEmailFacts(input);
	if (typeof facts === 'string') return facts;
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noSuchProject;
	const sender = await findEmailSender(caller.supabase, facts.from);
	const raised = await raiseForSender(caller, { input, facts, sender, project });
	if (typeof raised === 'string') return raised;
	const source = { facts, sender, raised: { kind: 'task', id: raised.taskId } } as const;
	const filing = await fileEmailFromSender(caller.supabase, source, caller.accountId);
	return `${raised.sentence} ${filing}`;
}

/** Puts a job an email asks for on someone's to-do list, its notes naming the email, and keeps the email as its source. */
export async function addTodoFromEmail(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const facts = validateEmailFacts(input);
	if (typeof facts === 'string') return facts;
	const todo = await addTodoFromInput(caller, { ...input, notes: notesNamingEmail(input, facts) });
	if (typeof todo === 'string') return todo;
	const sender = await findEmailSender(caller.supabase, facts.from);
	const source = { facts, sender, raised: { kind: 'todo', id: todo.id } } as const;
	const filing = await fileEmailFromSender(caller.supabase, source, caller.accountId);
	return `Added:\n${todoLine(todo)}\n${filing}`;
}

type Raising = { input: Record<string, unknown>; facts: EmailFacts; sender: EmailSender; project: Project };

function raiseForSender(caller: McpCaller, raising: Raising): Promise<RaisedTask | string> {
	const { sender, project, input } = raising;
	const isSendersOwnProject = isSentByClient(sender, project.clientId);
	if (!isSendersOwnProject) return raiseTask(caller, input);
	const supportRequest = asSupportRequest(raising);
	return raiseSupportTask(caller, supportRequest);
}

function asSupportRequest(raising: Raising): Record<string, unknown> {
	const { input, facts } = raising;
	const details = readOptionalText(input, 'details');
	return { ...input, want: details ?? facts.summary, benefit: readText(input, 'storyBenefit') };
}

function notesNamingEmail(input: Record<string, unknown>, facts: EmailFacts): string {
	const notes = readOptionalText(input, 'notes');
	const source = `From the email "${facts.subject}" from ${facts.from}, sent ${facts.sentAt}: ${gmailThreadLink(facts)}`;
	return notes === null ? source : `${notes}\n\n${source}`;
}
