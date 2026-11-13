import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nobodyOnTheRegister } from './describePeople';
import { noSuchPerson } from './describePerson';
import { peopleRegisterActions } from './peopleRegisterActions';
import { personFieldRefusals } from '$lib/data/validatePersonFields';
import type { McpCaller } from '../resolveMcpCaller';

const samId = '11111111-1111-4111-8111-111111111111';
const unknownId = '22222222-2222-4222-8222-222222222222';

const { register, personAdded, personDeleted } = vi.hoisted(() => ({
	register: { people: [] as Record<string, unknown>[] },
	personAdded: vi.fn(),
	personDeleted: vi.fn()
}));

const sam = {
	id: samId,
	name: 'Sam Rivers',
	email: 'sam@example.com',
	phone: '',
	officerId: null,
	sourceUrl: '',
	leadSource: 'staff',
	createdAt: '2026-11-01T09:00:00Z',
	seniority: 'director',
	isDecisionMaker: true,
	warmth: 'warm',
	lastContactedOn: null,
	nextAction: 'Call after the trade show',
	nextActionDue: '2026-11-20',
	companyStages: ['lead', 'client']
};

vi.mock('$lib/server/people/getPeople', () => ({ getPeople: async () => register.people }));
vi.mock('$lib/server/people/addPerson', () => ({ addPerson: personAdded }));
vi.mock('$lib/server/people/getPerson', () => ({
	getPerson: async (_supabase: unknown, personId: string) => (personId === samId ? { ...sam, links: [], notes: [] } : null)
}));
vi.mock('$lib/server/people/getCompaniesForPerson', () => ({
	getCompaniesForPerson: async () => [{ id: 'client-1', name: 'Rivers Ltd' }, { id: 'client-2', name: 'Rivers Holdings' }]
}));
vi.mock('$lib/server/people/deletePerson', () => ({ deletePerson: personDeleted }));

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

function run(name: string, input: Record<string, unknown>) {
	const action = peopleRegisterActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('the People register through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		register.people = [sam];
	});

	it('lists everyone with their standing, next action and the stages of their companies', async () => {
		expect(await run('list_people', {})).toBe(
			`Sam Rivers — Director — Warm — decision maker — Call after the trade show by 20 Nov 2026 — companies: Lead, Client — person ${samId}`
		);
		register.people = [];
		expect(await run('list_people', {})).toBe(nobodyOnTheRegister);
	});

	it('adds a person with the fields the Add a person form takes, trimmed and checked', async () => {
		personAdded.mockResolvedValue({ personId: samId, wasAlreadyKnown: false });
		const answer = await run('add_person', { name: ' Sam Rivers ', email: 'Sam@Example.com', seniority: 'director' });
		expect(personAdded).toHaveBeenCalledWith(staff.supabase, { name: 'Sam Rivers', email: 'sam@example.com', phone: '', seniority: 'director' });
		expect(answer).toBe(`Sam Rivers is on the People register as a lead — person ${samId}.`);
	});

	it('gives back the person already held under that email rather than adding them twice', async () => {
		personAdded.mockResolvedValue({ personId: samId, wasAlreadyKnown: true });
		expect(await run('add_person', { name: 'Sam Rivers', email: 'sam@example.com' })).toBe(`sam@example.com is already on the People register — person ${samId}.`);
	});

	it('refuses a person with no name, a misshapen email or an unknown seniority, writing nothing', async () => {
		expect(await run('add_person', { email: 'sam@example.com' })).toBe(personFieldRefusals.nameRequired);
		expect(await run('add_person', { name: 'Sam', email: 'sam at example' })).toBe(personFieldRefusals.emailNotAnAddress);
		expect(await run('add_person', { name: 'Sam', seniority: 'boss' })).toContain('seniority is one of');
		expect(personAdded).not.toHaveBeenCalled();
	});

	it('deletes a person and says how many companies they came off', async () => {
		expect(await run('delete_person', { personId: samId })).toBe(
			'Sam Rivers is deleted from the People register, with their links and notes, and taken off 2 companies.'
		);
		expect(personDeleted).toHaveBeenCalledWith(staff.supabase, samId);
	});

	it('refuses to delete by an id that is not one, or that nobody has', async () => {
		expect(await run('delete_person', { personId: 'sam' })).toContain('personId must be an id');
		expect(await run('delete_person', { personId: unknownId })).toBe(noSuchPerson);
		expect(personDeleted).not.toHaveBeenCalled();
	});
});
