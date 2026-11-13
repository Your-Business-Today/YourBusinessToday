const projectRoute = '/projects/{projectId}';
const taskRoute = '/projects/{projectId}/tasks/{taskId}';

const boardViews = () => [
	{ route: '/projects', name: 'Projects', purpose: 'Pick the project to work on', shows: 'Project' },
	{ route: projectRoute, name: 'Project', purpose: "See the project's board", shows: null },
	{ route: taskRoute, name: 'Task', purpose: 'Read and work one task', shows: 'Task' },
	{ route: '/sign-in', name: 'Sign in', purpose: 'Sign in to the site', shows: null }
];

const boardLinks = () => [
	{ fromRoute: '/projects', toRoute: projectRoute, how: 'a row of the table' },
	{ fromRoute: projectRoute, toRoute: taskRoute, how: null },
	{ fromRoute: '/sign-in', toRoute: '/projects', how: null }
];

const boardEntryPoints = () => [
	{ route: taskRoute, arrivesBy: 'A link in an email' },
	{ route: '/sign-in', arrivesBy: 'Sign in' }
];

const answerAnAsk = () => ({
	key: 'answer-an-ask',
	name: 'Answer an ask',
	role: 'Owner',
	story: 'As an owner, I want to answer what waits on me, so that the build goes on',
	stationKey: null,
	steps: [{ route: taskRoute, does: 'answers the ask' }]
});

const workATask = () => ({
	key: 'work-a-task',
	name: 'Work a task',
	role: 'Owner',
	story: 'As an owner, I want to open a task from my board, so that I can work it',
	stationKey: 'plan-the-work',
	steps: [
		{ route: '/sign-in', does: null },
		{ route: '/projects', does: 'picks the project' },
		{ route: projectRoute, does: null },
		{ route: taskRoute, does: 'works the task' }
	]
});

/** A small product's journey map as a person's Claude would file it, in the order it is read back. */
export function boardJourneyMapInput(): Record<string, unknown> {
	return {
		commit: '4f5381d0a1',
		views: boardViews(),
		links: boardLinks(),
		entryPoints: boardEntryPoints(),
		journeys: [answerAnAsk(), workATask()]
	};
}
