import { describe, expect, it, vi } from 'vitest';
import { actionsFor } from './actionRegistry';
import { runAction } from './runAction';
import { idPathsOf, fieldsDescribedAsIdsOf } from './everyActionIdPaths.fixture';
import type { McpCaller } from './resolveMcpCaller';
import type { AccountStanding } from './resolveAccountStanding';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;
const notAnId = 'not-an-id';
const refusedAtTheGate = 'Nothing was done';

const databaseNeverReached = new Proxy({}, {
	get: () => {
		throw new Error('The action reached the database past the id gate');
	}
});
const caller = { ...anAdministrator, accountId: '', supabase: databaseNeverReached } as unknown as McpCaller;

const identifiersEachActionChecksItself = new Set([
	'assignedTo',
	'chair',
	'member',
	'owner',
	'pagesCited',
	'replacesDecision',
	'requestedBy',
	'route',
	'waitingOn'
]);

const everyAction = actionsFor(anAdministrator, null);
const everyIdPath = everyAction.flatMap((action) => idPathsOf(action).map((path) => ({ action, ...path })));
const everyRequiredIdPath = everyIdPath.filter((path) => path.isRequired);

describe('every action’s id inputs are refused at the gate, before the database', () => {
	it('finds the id inputs of the actions', () => {
		expect(everyIdPath.length).toBeGreaterThan(everyAction.length);
	});

	it.each(everyIdPath.map((path) => [path.action.name, path.shownAs, path]))(
		'%s refuses a value of %s that is not an id',
		async (_name, shownAs, path) => {
			const answer = await runAction(caller, path.action.name, path.inputGiving(notAnId));
			expect(answer).toContain(shownAs);
			expect(answer).toContain(refusedAtTheGate);
		}
	);

	it.each(everyRequiredIdPath.map((path) => [path.action.name, path.shownAs, path]))(
		'%s refuses %s when it is empty or left out',
		async (_name, shownAs, path) => {
			const emptyAnswer = await runAction(caller, path.action.name, path.inputGiving(''));
			const leftOutAnswer = await runAction(caller, path.action.name, path.inputGiving(undefined));
			expect(emptyAnswer).toContain(shownAs);
			expect(leftOutAnswer).toContain(shownAs);
			expect(leftOutAnswer).toContain(refusedAtTheGate);
		}
	);

	it('names every input that holds an id with a name ending in Id, or checks it in its own action', () => {
		const unnamed = everyAction
			.flatMap((action) => fieldsDescribedAsIdsOf(action.inputSchema))
			.filter((name) => !identifiersEachActionChecksItself.has(name));
		expect(unnamed).toEqual([]);
	});
});
