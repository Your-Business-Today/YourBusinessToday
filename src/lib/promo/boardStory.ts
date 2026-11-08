import { boardColumns } from './promoBoard';

export type BoardTaskStory = { task: number; startColumn: number; advances: number[] };

export const liveColumn = boardColumns.length - 1;

/** The tasks of boardTasks as the film shows them: where each starts and the board beats it moves on a column. */
export const boardStory: BoardTaskStory[] = [
	{ task: 1, startColumn: 0, advances: [2, 5, 9, 13] },
	{ task: 10, startColumn: 0, advances: [6.5, 16] },
	{ task: 9, startColumn: 0, advances: [11.5, 17] },
	{ task: 11, startColumn: 1, advances: [4, 11, 15] },
	{ task: 8, startColumn: 1, advances: [8, 15.5, 16.5] },
	{ task: 6, startColumn: 2, advances: [3.5, 7] },
	{ task: 7, startColumn: 2, advances: [10.5, 14] },
	{ task: 3, startColumn: 2, advances: [6, 10] },
	{ task: 5, startColumn: 3, advances: [3] },
	{ task: 4, startColumn: 3, advances: [1] },
	{ task: 2, startColumn: 4, advances: [] },
	{ task: 0, startColumn: 4, advances: [] }
];
