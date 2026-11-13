import { describe, expect, it } from 'vitest';
import { journeyColoursOf, journeyLineMapOf } from './journeyLineMap';
import { chosenRoleOf, chosenViewOf } from './journeySiteMapAddress';
import { faultCountsOf, viewRowsOf } from './journeyViewRows';
import type { Journey, JourneyMap } from '$lib/data/journeyMap/journeyMap';

const projectRoute = '/projects/{projectId}';
const view = (route: string, name: string) => ({ route, name, purpose: `Use ${name}`, shows: null });
const journey = (key: string, role: string, routes: string[]): Journey => ({
	key,
	name: key,
	role,
	story: `As ${role}, I want ${key}`,
	stationKey: null,
	steps: routes.map((route) => ({ route, does: null }))
});

const journeyMap: JourneyMap = {
	commit: 'abc1234',
	versionNumber: 2,
	filedAt: '2026-11-13T05:00:00Z',
	views: [view('/sign-in', 'Sign in'), view('/projects', 'Projects'), view(projectRoute, 'Project'), view('/people', 'People')],
	links: [{ fromRoute: '/sign-in', toRoute: '/projects', how: null }],
	entryPoints: [{ route: '/sign-in', arrivesBy: 'Sign in' }],
	journeys: [
		journey('build-a-feature', 'Owner', ['/sign-in', '/projects', projectRoute]),
		journey('pick-a-project', 'Owner', ['/sign-in', '/projects']),
		journey('see-the-board', 'Client', ['/sign-in', projectRoute])
	]
};

describe("a product's journeys on the line map", () => {
	const colours = journeyColoursOf(journeyMap);

	it('draws one role at a time, a line a journey and a station a view', () => {
		const map = journeyLineMapOf(journeyMap, 'Owner', colours);
		expect(map.lines.map((line) => line.stops)).toEqual([['/sign-in', '/projects', projectRoute], ['/sign-in', '/projects']]);
		expect(Object.keys(map.stations)).toEqual(['/sign-in', '/projects', projectRoute]);
	});

	it("colours each journey by its place among its own role's journeys", () => {
		expect(colours.get('build-a-feature')).toEqual(colours.get('see-the-board'));
		expect(colours.get('pick-a-project')).not.toEqual(colours.get('build-a-feature'));
	});

	it('marks a view on no journey and a step nothing leads to', () => {
		const rows = viewRowsOf(journeyMap, colours);
		const people = rows.find((row) => row.route === '/people');
		const project = rows.find((row) => row.route === projectRoute);
		expect(people?.isOnNoJourney).toBe(true);
		expect(project?.unreachedSteps.map((step) => step.fromName)).toEqual(['Projects', 'Sign in']);
		expect(faultCountsOf(rows)).toEqual({ viewsOnNoJourney: 1, unreachedSteps: 2 });
	});
});

describe('the address of the Site map tab', () => {
	it('opens a linked view and the first role whose journeys pass through it', () => {
		const address = new URL('https://ybt.test/projects/p/site-map?screen=/projects/[projectId]');
		const chosen = chosenViewOf(address, journeyMap);
		expect(chosen?.name).toEqual('Project');
		expect(chosenRoleOf(address, journeyMap, chosen)).toEqual('Owner');
	});

	it('keeps the role the address chose', () => {
		const address = new URL('https://ybt.test/projects/p/site-map?role=Client');
		expect(chosenRoleOf(address, journeyMap, undefined)).toEqual('Client');
	});
});
