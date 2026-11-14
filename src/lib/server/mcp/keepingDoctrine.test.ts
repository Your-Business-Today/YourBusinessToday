import { describe, expect, it } from 'vitest';
import { taskRemovalActions } from './actions/taskRemovalActions';
import { workingDoctrine } from './workingDoctrine';

const [deleteTaskAction] = taskRemovalActions;
const { guidance = '', summary } = deleteTaskAction;

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

	it('names the one door that still takes finished work with it', () => {
		expect(workingDoctrine).toContain('delete_project');
		expect(workingDoctrine).toContain('never a way of tidying up');
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
