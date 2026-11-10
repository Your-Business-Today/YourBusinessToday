import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actionsFor } from './actionRegistry';
import { isGatedByModuleRule, moduleAction, moduleNotSwitchedOn, moduleOrganisationField } from './organisationModuleGate';
import { objectSchema, type McpAction } from './actionTypes';
import { organisationModules, type OrganisationModule } from '$lib/data/organisationModules';
import type { AccountStanding } from './resolveAccountStanding';
import type { McpCaller } from './resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const switchedOnModules = vi.hoisted(() => ({ current: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({
	getSwitchedOnModules: async () => switchedOnModules.current
}));

const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;
const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;
const stuartElsewhere = { ...nigelOnJewel, accountId: 'stuart', organisationMemberships: [] } as McpCaller;

const moduleWords: Record<OrganisationModule, RegExp> = {
	books: /(^|_)books?(_|$)/,
	brand: /(^|_)brand(_|$)/,
	business_brain: /(^|_)brain(_|$)/,
	boardroom: /(^|_)boardroom(_|$)/
};

const readLedger = moduleAction('books', {
	name: 'read_books_ledger',
	area: 'organisations',
	audience: 'everyone',
	isWrite: false,
	summary: 'a ledger',
	inputSchema: objectSchema({ organisationId: { type: 'string' } }, ['organisationId']),
	run: async (_caller, _input, organisation) => `The ledger of ${organisation.name}.`
});

describe('every connector action of a module asks the one rule', () => {
	const everyAction = actionsFor(anAdministrator, null);

	it.each(organisationModules)('an action named for %s is declared as that module', (module) => {
		const named = everyAction.filter((action) => moduleWords[module].test(action.name));
		expect(named.filter((action) => action.module !== module).map((action) => action.name)).toEqual([]);
	});

	it('is built by moduleAction, so it cannot run before the rule says yes', () => {
		const moduleActions = everyAction.filter((action) => action.module !== undefined);
		expect(moduleActions.filter((action) => !isGatedByModuleRule(action)).map((action) => action.name)).toEqual([]);
	});

	it('holds every books action behind the Books rule', () => {
		const booksAreaActions = everyAction.filter((action) => action.area === 'books');
		expect(booksAreaActions.length).toBeGreaterThan(0);
		const ungated = booksAreaActions.filter((action) => action.module !== 'books' || !isGatedByModuleRule(action));
		expect(ungated.map((action) => action.name)).toEqual([]);
	});

	it('names the organisation it works on', () => {
		const moduleActions = everyAction.filter((action) => action.module !== undefined);
		const requiredFields = (action: McpAction) => {
			const schema = action.inputSchema;
			return schema.required as string[];
		};
		const unnamed = moduleActions.filter((action) => !requiredFields(action).includes(moduleOrganisationField));
		expect(unnamed.map((action) => action.name)).toEqual([]);
	});
});

describe('moduleAction', () => {
	beforeEach(() => {
		switchedOnModules.current = [];
	});

	it('refuses while the module is off, however reachable the organisation', async () => {
		expect(await readLedger.run(nigelOnJewel, { organisationId: 'jewel' })).toBe(moduleNotSwitchedOn('books'));
	});

	it('refuses someone who does not reach the organisation, with the module on', async () => {
		switchedOnModules.current = ['books'];
		expect(await readLedger.run(stuartElsewhere, { organisationId: 'jewel' })).toBe(moduleNotSwitchedOn('books'));
	});

	it('runs for someone on the organisation once the module is on', async () => {
		switchedOnModules.current = ['books'];
		expect(await readLedger.run(nigelOnJewel, { organisationId: 'jewel' })).toBe('The ledger of Jewel Enterprises.');
		expect(isGatedByModuleRule(readLedger)).toBe(true);
	});
});
