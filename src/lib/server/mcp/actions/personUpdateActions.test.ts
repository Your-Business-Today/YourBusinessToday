import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchPerson } from './describePerson';
import { personUpdateActions } from './personUpdateActions';
import { personFieldRefusals } from '$lib/data/validatePersonFields';
import type { McpCaller } from '../resolveMcpCaller';

const samId = '11111111-1111-4111-8111-111111111111';
const unknownId = '22222222-2222-4222-8222-222222222222';
const samsListingId = '33333333-3333-4333-8333-333333333333';
const someoneElsesListingId = '44444444-4444-4444-8444-444444444444';

const { profileSaved, roleSaved } = vi.hoisted(() => ({ profileSaved: vi.fn(), roleSaved: vi.fn() }));

const sam = {
	id: samId,
	name: 'Sam Rivers',
	email: 'sam@example.com',
	phone: '0161',
	officerId: null,
	sourceUrl: '',
	leadSource: 'staff',
	createdAt: '2026-11-01T09:00:00Z',
	seniority: 'director',
	isDecisionMaker: false,
	warmth: 'cold',
	lastContactedOn: null,
	nextAction: '',
	nextActionDue: null,
	links: [],
	notes: []
};

vi.mock('$lib/server/people/getPerson', () => ({
	getPerson: async (_supabase: unknown, personId: string) => (personId === samId ? sam : null)
}));
vi.mock('$lib/server/people/getCompaniesForPerson', () => ({
	getCompaniesForPerson: async () => [{ id: 'client-1', name: 'Rivers Ltd', contactId: samsListingId }]
}));
vi.mock('$lib/server/people/updatePersonProfile', () => ({
	personProfileSaves: { saved: 'saved', emailTaken: 'email_taken' },
	updatePersonProfile: profileSaved
}));
vi.mock('$lib/server/clients/updateContactRole', () => ({ updateContactRole: roleSaved }));

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const [updatePerson] = personUpdateActions;

describe('changing a person through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		profileSaved.mockResolvedValue('saved');
	});

	it('changes only the fields given and keeps the rest as held', async () => {
		const answer = await updatePerson.run(staff, { personId: samId, warmth: 'hot', isDecisionMaker: true, nextAction: 'Book lunch', nextActionDue: '2026-11-28' });
		expect(answer).toBe('Sam Rivers saved.');
		expect(profileSaved).toHaveBeenCalledWith(staff.supabase, samId, {
			name: 'Sam Rivers',
			email: 'sam@example.com',
			phone: '0161',
			seniority: 'director',
			isDecisionMaker: true,
			warmth: 'hot',
			lastContactedOn: null,
			nextAction: 'Book lunch',
			nextActionDue: '2026-11-28'
		});
	});

	it('saves the role on the listing at the company it belongs to', async () => {
		await updatePerson.run(staff, { personId: samId, contactId: samsListingId, role: 'Managing director' });
		expect(roleSaved).toHaveBeenCalledWith(staff.supabase, samsListingId, 'Managing director');
	});

	it('refuses a role on a listing that is not this person’s', async () => {
		const answer = await updatePerson.run(staff, { personId: samId, contactId: someoneElsesListingId, role: 'Owner' });
		expect(answer).toContain('No company lists this person under that contact id');
		expect(roleSaved).not.toHaveBeenCalled();
	});

	it('refuses a field that does not fit its column before reading anyone', async () => {
		expect(await updatePerson.run(staff, { personId: samId, lastContactedOn: 'yesterday' })).toBe(personFieldRefusals.lastContactedNotADay);
		expect(await updatePerson.run(staff, { personId: samId, name: ' ' })).toBe(personFieldRefusals.nameRequired);
		expect(profileSaved).not.toHaveBeenCalled();
	});

	it('refuses an empty change, a stranger’s id and an email someone else holds', async () => {
		expect(await updatePerson.run(staff, { personId: samId })).toContain('Nothing was given to change');
		expect(await updatePerson.run(staff, { personId: unknownId, warmth: 'hot' })).toBe(noSuchPerson);
		profileSaved.mockResolvedValue('email_taken');
		expect(await updatePerson.run(staff, { personId: samId, email: 'taken@example.com' })).toContain('already belongs to someone else');
	});
});
