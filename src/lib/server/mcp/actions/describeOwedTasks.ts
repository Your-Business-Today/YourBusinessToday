import { accountNameLookup } from '$lib/data/accountNames';
import { formatBritishDate } from '$lib/data/britishDate';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { OwedTasks } from './owedTasks';

const longestExcerpt = 240;
const lineBreaks = /\s*\n\s*/g;

/** The tasks a person owes, each with its project and the latest message said on it. */
export function describeOwedTasks(owed: OwedTasks): string[] {
	const assignedHeading = countedHeading('Tasks assigned to you', owed.assigned);
	return [
		assignedHeading,
		...owed.assigned.map((task) => owedTaskLine(task, owed)),
		'',
		...namedSection(owed)
	];
}

function namedSection(owed: OwedTasks): string[] {
	if (owed.name === null) {
		return [
			'Tasks that name you were not looked for: your account has no name. Call this again ' +
				'with name, the first name people write in task titles for you.'
		];
	}
	const heading = countedHeading(`Tasks that name ${owed.name}, not assigned to you`, owed.named);
	return [heading, ...owed.named.map((task) => owedTaskLine(task, owed))];
}

function countedHeading(heading: string, tasks: GlobalTask[]): string {
	if (tasks.length === 0) return `${heading}: none.`;
	return `${heading} (${tasks.length}):`;
}

function owedTaskLine(task: GlobalTask, owed: OwedTasks): string {
	const status = taskStatusLabels[task.status];
	const where = `"${task.title}" on ${task.projectName}, ${status} (task id: ${task.id})`;
	return `- ${where}. ${latestMessageSentence(task, owed)}`;
}

export function latestMessageSentence(task: GlobalTask, owed: OwedTasks): string {
	const message = owed.latestByTask.get(task.id);
	if (message === undefined) return 'Nothing said on it yet.';
	const authorName = accountNameLookup(owed.accounts)(message.authorAccountId);
	const date = formatBritishDate(message.createdAt);
	return `Latest message, ${authorName}, ${date}: ${excerpt(message.body)}`;
}

function excerpt(body: string): string {
	const oneLine = body.replace(lineBreaks, ' ').trim();
	if (oneLine.length <= longestExcerpt) return oneLine;
	return `${oneLine.slice(0, longestExcerpt)}…`;
}
