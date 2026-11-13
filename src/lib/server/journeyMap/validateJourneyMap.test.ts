import { describe, expect, it } from 'vitest';
import { journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';
import { boardJourneyMapInput } from './journeyMapFixtures';
import { validateJourneyMap } from './validateJourneyMap';

type Entries = Record<string, unknown>[];

function refusalFor(input: Record<string, unknown>): string {
	const reading = validateJourneyMap(input);
	return 'refusal' in reading ? reading.refusal : '';
}

function withEntry(list: string, index: number, change: Record<string, unknown>): Record<string, unknown> {
	const input = boardJourneyMapInput();
	const entries = input[list] as Entries;
	entries[index] = { ...entries[index], ...change };
	return input;
}

describe('a journey map read from a connector call', () => {
	it('reads a whole version as it was given', () => {
		const input = boardJourneyMapInput();
		expect(validateJourneyMap(input)).toEqual(input);
	});

	it('refuses a commit that is not one', () => {
		expect(refusalFor({ ...boardJourneyMapInput(), commit: 'main' })).toContain('commit must be the commit');
	});

	it('refuses a version with no views', () => {
		expect(refusalFor({ ...boardJourneyMapInput(), views: [] })).toBe('views is empty: file every view of the product.');
	});

	it('refuses a name longer than its column, naming the view and the limit', () => {
		const longName = 'x'.repeat(limits.viewNameLength + 1);
		expect(refusalFor(withEntry('views', 0, { name: longName }))).toBe(
			`View /projects name is too long: keep it to ${limits.viewNameLength} characters.`
		);
	});

	it('refuses a route that does not start at the root, and a route given twice', () => {
		expect(refusalFor(withEntry('views', 0, { route: 'projects' }))).toContain('must be a route that starts with /');
		expect(refusalFor(withEntry('views', 1, { route: '/projects' }))).toContain('repeats the route /projects');
	});

	it('refuses a link, an entry point or a step that names a view the version does not hold', () => {
		expect(refusalFor(withEntry('links', 0, { toRoute: '/gone' }))).toBe(
			'Link 1 toRoute "/gone" is not the route of a view in this version.'
		);
		expect(refusalFor(withEntry('entryPoints', 0, { route: '/gone' }))).toContain('is not the route of a view');
		const journeys = boardJourneyMapInput();
		(journeys.journeys as Entries)[1].steps = [{ route: '/gone' }];
		expect(refusalFor(journeys)).toBe('Journey "work-a-task" step 1 route "/gone" is not the route of a view in this version.');
	});

	it('refuses a link to itself and a link given twice', () => {
		expect(refusalFor(withEntry('links', 0, { toRoute: '/projects' }))).toBe('Link 1 goes from /projects to itself.');
		const repeat = { fromRoute: '/projects', toRoute: '/projects/{projectId}' };
		expect(refusalFor(withEntry('links', 1, repeat))).toBe(
			'Link 2 repeats /projects to /projects/{projectId}: give each link once.'
		);
	});

	it('refuses a journey with no steps, a key given twice and a station key of the wrong shape', () => {
		expect(refusalFor(withEntry('journeys', 0, { steps: [] }))).toBe('Journey "answer-an-ask" has no steps: give its views in order.');
		expect(refusalFor(withEntry('journeys', 1, { key: 'answer-an-ask' }))).toContain('repeats the key "answer-an-ask"');
		expect(refusalFor(withEntry('journeys', 0, { stationKey: 'Plan the work' }))).toContain('lower-case words joined');
	});

	it('refuses a story longer than its column, and more steps than a journey may hold', () => {
		const longStory = 'x'.repeat(limits.storyLength + 1);
		expect(refusalFor(withEntry('journeys', 0, { story: longStory }))).toContain(`keep it to ${limits.storyLength}`);
		const tooManySteps = Array.from({ length: limits.mostStepsInAJourney + 1 }, () => ({ route: '/projects' }));
		expect(refusalFor(withEntry('journeys', 0, { steps: tooManySteps }))).toContain(`keep it to ${limits.mostStepsInAJourney}`);
	});
});
