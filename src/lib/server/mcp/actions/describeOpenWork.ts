import { countOf } from '$lib/data/countOf';
import { departmentLabels, type Department } from '$lib/data/department';
import { taskStatusLabels, type TaskStatus } from '$lib/data/taskStatus';
import { countOpenWork, type OpenWorkCount } from '$lib/data/openWorkCount';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';
import type { Todo } from '$lib/server/todos/todoRecord';

/** Everything one person has open, as read for the question "how many / what does X have". */
export type OpenWork = {
	name: string;
	isCaller: boolean;
	projectCount: number;
	assigned: GlobalTask[];
	followUps: GlobalTask[];
	named: GlobalTask[];
	questions: WaitingQuestion[];
	todos: Todo[];
};

const howToAnswer =
	'This is the real count of every open item whose next move is theirs, nothing ranked away. A task ' +
	'is theirs when an open ask on it waits on them; else, unless it is a build, which is Claude\u2019s, ' +
	'when an ask of theirs on it was answered, when it is assigned to them, or when they raised it and ' +
	'nobody is assigned. Give the person these numbers as they are. Never answer a count from ' +
	'what_do_i_need_to_do (one item) or read_team_work (internal jobs only).';

/** The counts first, then every open task and ask, so a total can be checked line by line. */
export function describeOpenWork(work: OpenWork): string {
	const { assigned, followUps, named, questions, todos } = work;
	const askKinds = questions.map((question) => question.askKind);
	const count = countOpenWork({ assigned, followUps, named, askKinds, todoCount: todos.length });
	const who = work.isCaller ? 'You have' : `${work.name} has`;
	return [
		howToAnswer,
		'',
		`# ${who} ${countOf(count.total, 'open item')}`,
		scopeLine(work),
		...countLines(count, work.isCaller),
		...breakdowns(count),
		...listed('Tasks in their name, their move', work.assigned.map(taskLine)),
		...listed('Tasks back with them', work.followUps.map(taskLine)),
		...listed('Tasks whose title names them', work.named.map(taskLine)),
		...listed('Asks waiting on them', work.questions.map(askLine)),
		...listed(work.isCaller ? 'Your to-dos' : 'To-dos they promised on these projects', work.todos.map(todoLine))
	].join('\n');
}

function scopeLine(work: OpenWork): string {
	const projects = countOf(work.projectCount, 'project');
	if (work.isCaller) return `Counted across every project you are on (${projects}).`;
	return `Counted across the ${projects} you can see; work of theirs on projects you are not on is not counted.`;
}

function countLines(count: OpenWorkCount, isCaller: boolean): string[] {
	return [
		`- Open tasks assigned to them, their move: ${count.assignedCount}`,
		`- Tasks back with them (an ask of theirs answered, or a job they raised that nobody took): ${count.followUpCount}`,
		`- Open tasks whose title names them, not assigned: ${count.namedCount}`,
		`- Answers to give: ${count.answerCount}`,
		`- Things to set up: ${count.setupCount}`,
		`- ${isCaller ? 'To-dos' : 'To-dos promised on these projects'}: ${count.todoCount}`
	];
}

function breakdowns(count: OpenWorkCount): string[] {
	if (count.assignedCount + count.followUpCount + count.namedCount === 0) return [];
	const byDepartment = [...count.byDepartment].map(([department, total]) => `${departmentLabels[department as Department]} ${total}`);
	const byStatus = [...count.byStatus].map(([status, total]) => `${taskStatusLabels[status as TaskStatus]} ${total}`);
	const byProject = [...count.byProject].sort((left, right) => right[1] - left[1]).map(([project, total]) => `${project} ${total}`);
	return ['', `Tasks by project: ${byProject.join(', ')}.`, `By department: ${byDepartment.join(', ')}.`, `By status: ${byStatus.join(', ')}.`];
}

function listed(heading: string, lines: string[]): string[] {
	if (lines.length === 0) return [];
	return ['', `## ${heading} (${lines.length})`, ...lines.map((line) => `- ${line}`)];
}

function taskLine(task: GlobalTask): string {
	return `${task.title} — ${taskStatusLabels[task.status]}, ${departmentLabels[task.department]}, ${task.projectName} (id: ${task.id})`;
}

function askLine(question: WaitingQuestion): string {
	return `${question.subjectTitle}, ${question.projectName} (${question.subjectKind} id: ${question.subjectId})`;
}

function todoLine(todo: Todo): string {
	const where = todo.taskTitle === null ? '' : `, on "${todo.taskTitle}"`;
	return `${todo.title}${where} (id: ${todo.id})`;
}
