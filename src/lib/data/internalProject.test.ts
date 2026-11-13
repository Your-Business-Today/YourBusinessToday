import { describe, expect, it } from 'vitest';
import { boardSidesOfProject, isInternalProject } from './internalProject';
import { boardSides } from './boardSide';
import { departments } from './department';

const noRepository = { repositoryUrl: '' };
const withRepository = { repositoryUrl: 'https://github.com/owner/office-move' };
const insurance = { department: departments.administration };
const website = { department: departments.development };
const hosting = { department: departments.infrastructure };

describe('an internal project', () => {
	it('is one with no repository and no development or infrastructure work', () => {
		expect(isInternalProject(noRepository, [])).toBe(true);
		expect(isInternalProject(noRepository, [insurance])).toBe(true);
	});

	it('is not one that already holds development or infrastructure work, so no project loses its tasks', () => {
		expect(isInternalProject(noRepository, [insurance, website])).toBe(false);
		expect(isInternalProject(noRepository, [hosting])).toBe(false);
	});

	it('is not one with a repository, however little work it holds', () => {
		expect(isInternalProject(withRepository, [])).toBe(false);
		expect(isInternalProject(withRepository, [insurance])).toBe(false);
	});

	it('shows Internal work alone, where any other project shows both sides', () => {
		expect(boardSidesOfProject(true)).toEqual([boardSides.internal]);
		expect(boardSidesOfProject(false)).toEqual([boardSides.development, boardSides.internal]);
		expect(boardSidesOfProject(false, true)).toEqual([boardSides.development]);
		expect(boardSidesOfProject(true, true)).toEqual([boardSides.internal]);
	});
});
