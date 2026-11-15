import { countOf } from '$lib/data/countOf';
import { listedInWords } from '$lib/data/listedInWords';
import { projectDeletionInputs, type ProjectContents } from '$lib/data/projectDeletion';
import { whatIsKeptOfDeletedTask } from '$lib/data/taskDeletion';

const { confirmProjectName } = projectDeletionInputs;
const howToKeepIt = 'That is update_project_details with status complete.';
const moveItBackFirst = 'If a task in it was marked done by mistake, move it back with update_task_status first.';
const nothingWasDeleted = 'Nothing was deleted.';
const finishedInstead = 'A project that has simply finished is set to complete with update_project_details instead.';
const whatIsKept = `${whatIsKeptOfDeletedTask} Nothing puts a project back.`;

/** What delete_project answers for a project that holds finished work: why it stays, and what to do instead. */
export function projectStays(refusal: string): string {
	return [refusal, howToKeepIt, moveItBackFirst, nothingWasDeleted].join(' ');
}

/** What delete_project answers before it deletes anything: what the project holds, and the word it waits for. */
export function whatProjectHolds(projectName: string, contents: ProjectContents, nameGiven: string | null): string {
	const { goals, tasks, files } = countsIn(contents);
	return [
		...wrongNameLines(projectName, nameGiven),
		`Nothing is deleted yet. Deleting "${projectName}" deletes everything in it:`,
		`- ${goals}`,
		`- ${tasks}, subtasks included`,
		`- ${files}`,
		whatIsKept,
		finishedInstead,
		`To go ahead, call delete_project again with ${confirmProjectName} "${projectName}", once the person has seen this.`
	].join('\n');
}

/** What delete_project answers once the project has gone. */
export function projectDeleted(projectName: string, contents: ProjectContents): string {
	const { goals, tasks, files } = countsIn(contents);
	return `"${projectName}" deleted, with ${listedInWords([goals, tasks, files])}. ${whatIsKept}`;
}

function wrongNameLines(projectName: string, nameGiven: string | null): string[] {
	if (nameGiven === null) return [];
	return [`"${nameGiven}" is not this project’s name, which is "${projectName}".`];
}

function countsIn(contents: ProjectContents): { goals: string; tasks: string; files: string } {
	return {
		goals: countOf(contents.goalCount, 'goal'),
		tasks: countOf(contents.openTaskCount, 'open task'),
		files: countOf(contents.attachedFileCount, 'attached file')
	};
}
