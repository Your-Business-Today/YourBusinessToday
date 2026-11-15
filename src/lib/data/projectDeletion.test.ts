import { describe, expect, it } from 'vitest';
import { deletionWarningFor, isProjectNamedBack, refusalToDeleteProject, type ProjectContents } from './projectDeletion';

const nothingFinished: ProjectContents = { goalCount: 2, openTaskCount: 5, finishedTaskCount: 0, attachedFileCount: 3 };
const workShipped: ProjectContents = { ...nothingFinished, finishedTaskCount: 187 };
const oneTaskShipped: ProjectContents = { ...nothingFinished, finishedTaskCount: 1 };

describe('refusalToDeleteProject', () => {
	it('lets a project go when nothing in it is finished, whatever else it holds', () => {
		expect(refusalToDeleteProject('Scratch', nothingFinished)).toBeNull();
	});

	it('keeps a project that holds finished tasks, and says how many and what to do instead', () => {
		const refusal = refusalToDeleteProject('Carp Mania', workShipped);
		expect(refusal).toContain('Carp Mania cannot be deleted: it has 187 finished tasks');
		expect(refusal).toContain('finished work is never deleted');
		expect(refusal).toContain('Set it to complete instead');
	});

	it('keeps a project for one finished task', () => {
		expect(refusalToDeleteProject('Carp Mania', oneTaskShipped)).toContain('it has one finished task,');
	});
});

describe('isProjectNamedBack', () => {
	it('is not named back when no name is given', () => {
		expect(isProjectNamedBack('Carp Mania', null)).toBe(false);
	});

	it('is not named back by another name, or by its own in another case', () => {
		expect(isProjectNamedBack('Carp Mania', 'Carp Manias')).toBe(false);
		expect(isProjectNamedBack('Carp Mania', 'carp mania')).toBe(false);
	});

	it('is named back by its own name, whatever space surrounds either', () => {
		expect(isProjectNamedBack('Carp Mania ', ' Carp Mania')).toBe(true);
	});
});

describe('deletionWarningFor', () => {
	it('says what goes with the project, and that finished work keeps it', () => {
		const warning = deletionWarningFor('Carp Mania');
		expect(warning).toContain('Deletes “Carp Mania” with every goal, task and subtask in it');
		expect(warning).toContain('A project with finished tasks is refused: set it to Complete instead.');
	});
});
