import { describe, expect, it } from 'vitest';
import { projectDeleted, projectStays, whatProjectHolds } from './describeProjectDeletion';
import type { ProjectContents } from '$lib/data/projectDeletion';

const projectName = 'Scratch';
const asNamed = `"${projectName}"`;
const contents: ProjectContents = { goalCount: 2, openTaskCount: 5, finishedTaskCount: 0, attachedFileCount: 1 };
const emptyProject: ProjectContents = { goalCount: 0, openTaskCount: 0, finishedTaskCount: 0, attachedFileCount: 0 };

describe('what delete_project answers', () => {
	it('says why a project with finished work stays, how to keep it, and that nothing went', () => {
		const answer = projectStays('Carp Mania cannot be deleted: it has 187 finished tasks.');
		expect(answer).toContain('Carp Mania cannot be deleted: it has 187 finished tasks.');
		expect(answer).toContain('update_project_details with status complete');
		expect(answer).toContain('move it back with update_task_status first');
		expect(answer.endsWith('Nothing was deleted.')).toBe(true);
	});

	it('lists what the project holds before anything is deleted, and the word it waits for', () => {
		const lines = whatProjectHolds(projectName, contents, null).split('\n');
		expect(lines[0]).toBe(`Nothing is deleted yet. Deleting ${asNamed} deletes everything in it:`);
		expect(lines.slice(1, 4)).toEqual(['- 2 goals', '- 5 open tasks, subtasks included', '- one attached file']);
		expect(lines.at(-1)).toBe(
			`To go ahead, call delete_project again with confirmProjectName ${asNamed}, once the person has seen this.`
		);
	});

	it('says what is kept and what is not, before the person decides', () => {
		const answer = whatProjectHolds(projectName, contents, null);
		expect(answer).toContain('A copy of each task is kept on the record of deletions, with its conversation.');
		expect(answer).toContain('Attached files are not kept, and nothing puts a project back.');
		expect(answer).toContain('A project that has simply finished is set to complete');
	});

	it('says first that a name given is not the project’s, and still deletes nothing', () => {
		const [firstLine, secondLine] = whatProjectHolds(projectName, contents, 'Scratchpad').split('\n');
		expect(firstLine).toBe(`"Scratchpad" is not this project’s name, which is ${asNamed}.`);
		expect(secondLine).toContain('Nothing is deleted yet.');
	});

	it('says what went with the project once it is deleted', () => {
		const answer = projectDeleted(projectName, contents);
		expect(answer).toContain(`${asNamed} deleted, with 2 goals, 5 open tasks and one attached file.`);
		expect(answer).toContain('A copy of each task is kept on the record of deletions');
	});

	it('says so plainly when the project held nothing', () => {
		expect(projectDeleted(projectName, emptyProject)).toContain('with no goals, no open tasks and no attached files.');
	});
});
