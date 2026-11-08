export type BoardTaskKind = 'Feature' | 'Fix' | 'Refactor';

export type BoardTask = { title: string; kind: BoardTaskKind; points: number };

export type BoardColumn = { name: string; step: string };

/** The board's columns, each with who moves a task through it. */
export const boardColumns: BoardColumn[] = [
	{ name: 'Raised', step: 'You raise it' },
	{ name: 'Sized', step: 'AI sizes it' },
	{ name: 'Building', step: 'AI builds it' },
	{ name: 'Reviewed', step: 'AI reviews it' },
	{ name: 'Live', step: 'You use it' }
];

/** The tasks done on the YourBusinessToday board when the promo was made, 7 Nov 2026. */
export const tasksDoneOnTheBoard = 376;

/** Real tasks from the YourBusinessToday board, each built and merged in the open. */
export const boardTasks: BoardTask[] = [
	{ title: 'A client contact connects their own Claude to YBT from the portal', kind: 'Feature', points: 2 },
	{ title: 'A visitor signs up on yourbusiness.today and their onboarding begins', kind: 'Feature', points: 2 },
	{ title: 'Every AI action on a goal or task is recorded on its lifecycle', kind: 'Feature', points: 5 },
	{ title: 'Fix email going to spam', kind: 'Fix', points: 2 },
	{ title: 'A person who raised a task sees on a live feed when it is started and done', kind: 'Feature', points: 2 },
	{ title: 'A client is shown that no other client can see their data on the portal', kind: 'Feature', points: 2 },
	{ title: 'Every migration runs itself through GitHub when its pull request merges', kind: 'Feature', points: 21 },
	{ title: 'REFACTOR: round 15', kind: 'Refactor', points: 13 },
	{ title: 'A project member works a project from a compact dashboard on any screen', kind: 'Feature', points: 2 },
	{ title: 'Animate the modals, menus, folds and tabs across the site', kind: 'Feature', points: 5 },
	{ title: 'Check every connector action works end to end, for each kind of person', kind: 'Feature', points: 2 },
	{ title: 'A goal or task one AI is considering or building is skipped by the others', kind: 'Feature', points: 5 }
];
