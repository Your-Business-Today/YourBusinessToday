import { describe, expect, it } from 'vitest';
import { cardPlacements, cardsInColumnAt, liveMoveBeats, tasksGoingLive, tasksGoneLiveBy } from './boardLayout';
import { boardStory, liveColumn } from './boardStory';
import { boardTasks, tasksDoneOnTheBoard } from './promoBoard';
import { boardShape } from './scene/boardShape';

const tasksTheFilmSendsLive = 8;
const workingColumns = Array.from({ length: liveColumn }, (_, column) => column);
const everyMoveBeat = [...new Set(boardStory.flatMap((story) => story.advances))];

describe('the board the film shows', () => {
	it('tells the story of real tasks from the board, each once', () => {
		const tasks = boardStory.map((story) => story.task);
		expect(new Set(tasks).size).toBe(boardStory.length);
		tasks.forEach((task) => expect(boardTasks[task]).toBeDefined());
	});

	it('sends eight tasks live, one at a time', () => {
		expect(tasksGoingLive).toBe(tasksTheFilmSendsLive);
		expect(new Set(liveMoveBeats).size).toBe(tasksGoingLive);
	});

	it('never moves a task past Live', () => {
		boardStory.forEach(({ startColumn, advances }) => {
			expect(startColumn + advances.length).toBeLessThanOrEqual(liveColumn);
		});
	});

	it('moves each task on one column at a time, never back', () => {
		cardPlacements.forEach((placements) => {
			placements.slice(1).forEach((placement, index) => {
				const previous = placements[index];
				const columnsMoved = placement.column - previous.column;
				expect(columnsMoved).toBeGreaterThanOrEqual(0);
				expect(columnsMoved).toBeLessThanOrEqual(1);
			});
		});
	});

	it('keeps every working column within the cards it can show', () => {
		everyMoveBeat.forEach((beat) => {
			workingColumns.forEach((column) => {
				expect(cardsInColumnAt(column, beat)).toBeLessThanOrEqual(boardShape.visibleSlots);
			});
		});
	});

	it('counts Live up to the tasks really done on the board by the end', () => {
		const countedAtTheStart = tasksDoneOnTheBoard - tasksGoingLive;
		expect(tasksGoneLiveBy(-Infinity)).toBe(0);
		expect(countedAtTheStart + tasksGoneLiveBy(Infinity)).toBe(tasksDoneOnTheBoard);
	});
});
