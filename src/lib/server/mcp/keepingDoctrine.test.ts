import { describe, expect, it } from 'vitest';
import { projectRemovalActions } from './actions/projectRemovalActions';
import { taskRemovalActions } from './actions/taskRemovalActions';
import { workingDoctrine } from './workingDoctrine';

const [deleteTaskAction] = taskRemovalActions;
const { guidance = '', summary } = deleteTaskAction;
const [deleteProjectAction] = projectRemovalActions;
const { guidance: projectGuidance = '', summary: projectSummary } = deleteProjectAction;

describe('rule 12 of the working doctrine, on finished work', () => {
	it('says finished work is never deleted, in every kind of session', () => {
		expect(workingDoctrine).toContain('12. Finished work is never deleted, in a build session or a chat');
		expect(workingDoctrine).toContain('delete_task refuses it');
	});

	it('has a task with subtasks deleted in two calls, the first deleting nothing', () => {
		expect(workingDoctrine).toContain('deleted in two calls');
		expect(workingDoctrine).toContain('deletes nothing and lists what is under it');
		expect(workingDoctrine).toContain('show the person that list');
	});

	it('keeps the finished subtasks and lets the open ones go only on a word', () => {
		expect(workingDoctrine).toContain('Its finished subtasks are always kept');
		expect(workingDoctrine).toContain('Its open subtasks go only when you say');
		expect(workingDoctrine).toContain('set_task_parent');
	});

	it('keeps a project that holds finished tasks, and has any other deleted only once it is named back', () => {
		expect(workingDoctrine).toContain('delete_project refuses it');
		expect(workingDoctrine).toContain('is set to complete instead');
		expect(workingDoctrine).toContain('never a way of tidying up');
		expect(workingDoctrine).toContain('with the project id alone it deletes nothing');
	});
});

describe('what delete_task says of itself', () => {
	it('promises in its summary that finished subtasks are kept', () => {
		expect(summary).toContain('delete a task that is not finished');
		expect(summary).toContain('finished subtasks are kept under a new completed task');
	});

	it('echoes the rule: finished work stays, and the first call only lists', () => {
		expect(guidance).toContain('Finished work is never deleted');
		expect(guidance).toContain('Call it first with the task id alone');
		expect(guidance).toContain('after the person has seen the list');
	});
});

describe('what delete_project says of itself', () => {
	it('promises in its summary that a project holding finished tasks is refused', () => {
		expect(projectSummary).toContain('delete a project created by mistake');
		expect(projectSummary).toContain('one that holds finished tasks is refused');
	});

	it('echoes the rule: finished work stays, and the first call only says what the project holds', () => {
		expect(projectGuidance).toContain('Finished work is never deleted');
		expect(projectGuidance).toContain('Call it first with the project id alone');
		expect(projectGuidance).toContain('after the person has seen that answer');
	});
});
