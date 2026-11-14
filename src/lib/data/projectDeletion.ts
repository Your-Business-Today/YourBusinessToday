import { countOf } from './countOf';

/** What a project holds, counted: deleting the project takes all of it. */
export type ProjectContents = {
	goalCount: number;
	openTaskCount: number;
	finishedTaskCount: number;
	attachedFileCount: number;
};

/** What the word that lets a project go is called where the connector asks for it. */
export const projectDeletionInputs = { confirmProjectName: 'confirmProjectName' } as const;

const keepInstead = 'Set it to complete instead, so the board keeps it and its history.';

/** What deleting a project does, said before anyone confirms it. */
export function deletionWarningFor(projectName: string): string {
	return (
		`Deletes “${projectName}” with every goal, task and subtask in it and their attached files, and nothing ` +
		'puts it back. A project with finished tasks is refused: set it to Complete instead.'
	);
}

/** Why the project must stay on the board, or null when nothing in it is finished. */
export function refusalToDeleteProject(projectName: string, contents: ProjectContents): string | null {
	if (contents.finishedTaskCount === 0) return null;
	const finishedTasks = countOf(contents.finishedTaskCount, 'finished task');
	return `${projectName} cannot be deleted: it has ${finishedTasks}, and finished work is never deleted. ${keepInstead}`;
}

/** Whether the project's own name was given back: the word its deletion waits for. */
export function isProjectNamedBack(projectName: string, nameGiven: string | null): boolean {
	if (nameGiven === null) return false;
	return nameGiven.trim() === projectName.trim();
}
