import { awaitingKinds, postedViaChannels } from '$lib/data/conversationTurn';
import { parseGlobalTaskRow } from '$lib/server/projects/getGlobalTaskPage';
import { taskStatuses } from '$lib/data/taskStatus';
import { todoStatuses } from '$lib/data/todo';
import type { SummarySources } from './describeSummary';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';

const jeremy = 'jeremy';
const scarlett = { id: 'scarlett', name: 'Scarlett', email: 'scarlett@example.com' };
const propertyServe = { id: 'jewel-ps-portal', name: 'Jewel Property Serve Portal' };
const passiveFire = { id: 'jewel-pfp-portal', name: 'Jewel PFP Portal' };

function taskOn(project: typeof propertyServe, id: string, title: string, department = 'development') {
	const projects = { name: project.name };
	const row = { id, title, status: 'backlog', kind: 'work', department, project_id: project.id, projects };
	return parseGlobalTaskRow(row);
}

const termsQuestion: WaitingQuestion = {
	id: 'message',
	goalId: null,
	taskId: 'terms',
	authorAccountId: scarlett.id,
	body: 'Jeremy, are terms v0.2 signed off?',
	isInternal: false,
	postedVia: postedViaChannels.claude,
	awaiting: { accountId: jeremy, kind: awaitingKinds.person },
	askKind: 'setup',
	pickedUpAt: null,
	createdAt: '2026-10-20T09:00:00Z',
	subjectKind: 'task',
	subjectId: 'terms',
	subjectTitle: 'Sign off the door survey terms',
	taskStatus: taskStatuses.inProgress,
	projectId: passiveFire.id,
	projectName: passiveFire.name
};

const insuranceTodo = {
	id: 'todo-1',
	ownerAccountId: jeremy,
	projectId: propertyServe.id,
	taskId: 'site',
	taskTitle: 'Get the website presentable',
	projectName: propertyServe.name,
	title: 'Put insurance in place',
	notes: null,
	status: todoStatuses.toDo,
	dueDate: null,
	createdBy: jeremy,
	createdAt: '2026-10-31T08:00:00Z',
	completedAt: null
};

const informationQuestion: WaitingQuestion = {
	...termsQuestion,
	id: 'scope',
	body: 'Jeremy, which bank feeds do you use?',
	askKind: null
};

export const jeremyOwes: SummarySources = {
	waiting: { questions: [termsQuestion, informationQuestion], askers: [scarlett] },
	todos: [insuranceTodo],
	owed: {
		assigned: [
			taskOn(propertyServe, 'backlog', 'Move the enquiries backlog'),
			taskOn(propertyServe, 'insurance', 'Put public liability insurance in place', 'administration')
		],
		named: [taskOn(passiveFire, 'xero', 'Jeremy: ask Xero for the bank statement scope')],
		name: 'Jeremy',
		latestByTask: new Map(),
		accounts: []
	},
	viewerId: jeremy
};

export const nothingAtAll = {
	...jeremyOwes,
	todos: [],
	waiting: { questions: [], askers: [] },
	owed: { ...jeremyOwes.owed, assigned: [], named: [] }
};
