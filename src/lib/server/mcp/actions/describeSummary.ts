import { latestMessageSentence, unnamedAccountNotice } from './describeOwedTasks';
import { messageLine } from './describeMessages';
import { subjectHeading } from './describeWaitingQuestions';
import { accountNameLookup } from '$lib/data/accountNames';
import { countOf } from '$lib/data/countOf';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { OwedTasks } from './owedTasks';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';
import type { WaitingQuestions } from './waitingQuestionsFor';

/** Everything a summary is made from: what waits on the person, what they owe, and their projects in order. */
export type SummarySources = {
	waiting: WaitingQuestions;
	owed: OwedTasks;
	viewerId: string;
	projectOrder: string[];
};

export const nothingOwed = 'Nothing waits on you and nothing is assigned to you on any project.';

/** The person's projects one by one, each with the decisions waiting on them and the work they owe. */
export function describeSummary(sources: SummarySources): string[] {
	return [...unnamedLines(sources.owed), ...projectLines(sources)];
}

function unnamedLines(owed: OwedTasks): string[] {
	if (owed.name !== null) return [];
	return [unnamedAccountNotice, ''];
}

function projectLines(sources: SummarySources): string[] {
	const projectIds = projectsWithSomething(sources);
	if (projectIds.length === 0) return [nothingOwed];
	return [totalsLine(sources), '', ...projectIds.flatMap((id) => projectSection(sources, id))];
}

function projectsWithSomething(sources: SummarySources): string[] {
	const { waiting, owed, projectOrder } = sources;
	const subjects = [...waiting.questions, ...owed.assigned, ...owed.named];
	const touched = new Set(subjects.map((subject) => subject.projectId));
	const unordered = [...touched].filter((id) => !projectOrder.includes(id));
	return [...projectOrder.filter((id) => touched.has(id)), ...unordered];
}

function totalsLine(sources: SummarySources): string {
	const { questions } = sources.waiting;
	const { assigned, named } = sources.owed;
	const decisions = countOf(questions.length, 'decision');
	const tasks = countOf(assigned.length + named.length, 'task');
	return `In all: ${decisions} waiting on you and ${tasks} for you to work.`;
}

function projectSection(sources: SummarySources, projectId: string): string[] {
	const { waiting, owed } = sources;
	const questions = waiting.questions.filter((question) => question.projectId === projectId);
	const assigned = owed.assigned.filter((task) => task.projectId === projectId);
	const named = owed.named.filter((task) => task.projectId === projectId);
	const [firstSubject] = [...questions, ...assigned, ...named];
	return [
		`## ${firstSubject.projectName}`,
		...decisionLines(questions, waiting.askers, sources.viewerId),
		...workLines('Work assigned to you', assigned, owed),
		...workLines(`Work that names ${owed.name}, not assigned to you`, named, owed),
		''
	];
}

function decisionLines(questions: WaitingQuestion[], askers: Account[], viewerId: string): string[] {
	if (questions.length === 0) return [];
	const nameOf = accountNameLookup(askers);
	const blocks = questions.flatMap((question) => {
		const authorName = nameOf(question.authorAccountId);
		return [subjectHeading(question), messageLine({ ...question, authorName }, viewerId)];
	});
	return [`Quick decisions waiting on you (${questions.length}):`, ...blocks];
}

function workLines(heading: string, tasks: GlobalTask[], owed: OwedTasks): string[] {
	if (tasks.length === 0) return [];
	return [`${heading} (${tasks.length}):`, ...tasks.map((task) => workLine(task, owed))];
}

function workLine(task: GlobalTask, owed: OwedTasks): string {
	const status = taskStatusLabels[task.status];
	return `- "${task.title}", ${status} (task id: ${task.id}). ${latestMessageSentence(task, owed)}`;
}
