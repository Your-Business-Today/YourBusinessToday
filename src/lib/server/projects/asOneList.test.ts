import { describe, expect, it } from 'vitest';
import { asOneList } from './asOneList';

const own = (name: string, teamProjectsAbove: number) => ({ name, teamProjectsAbove });
const team = (name: string) => ({ name });
const namesOf = (list: { name: string }[]) => list.map((project) => project.name);

const lifeRecord = team('Life record');
const skillSwap = team('Skill swap');
const jungleStore = team('Jungle store');
const teamProjects = [lifeRecord, skillSwap, jungleStore];

describe('asOneList', () => {
	it('lists a person’s own projects first while none has been placed among the others', () => {
		const ownProjects = [own('Florist site', 0), own('Bakery app', 0)];
		expect(namesOf(asOneList(ownProjects, teamProjects))).toEqual([
			'Florist site',
			'Bakery app',
			'Life record',
			'Skill swap',
			'Jungle store'
		]);
	});

	it('puts an own project below as many of the others as it was placed under', () => {
		const ownProjects = [own('Bakery app', 0), own('Florist site', 1), own('Garden plan', 3)];
		expect(namesOf(asOneList(ownProjects, teamProjects))).toEqual([
			'Bakery app',
			'Life record',
			'Florist site',
			'Skill swap',
			'Jungle store',
			'Garden plan'
		]);
	});

	it('keeps both boards’ orders whatever the counts say', () => {
		const ownProjects = [own('Bakery app', 2), own('Florist site', 1), own('Garden plan', 9)];
		expect(namesOf(asOneList(ownProjects, teamProjects))).toEqual([
			'Life record',
			'Skill swap',
			'Bakery app',
			'Florist site',
			'Jungle store',
			'Garden plan'
		]);
	});

	it('is the other board alone when a person owns nothing, or is on nothing', () => {
		expect(asOneList([], teamProjects)).toEqual(teamProjects);
		expect(namesOf(asOneList([own('Florist site', 2)], []))).toEqual(['Florist site']);
	});
});
