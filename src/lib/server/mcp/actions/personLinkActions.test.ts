import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchPerson } from './describePerson';
import { personLinkActions } from './personLinkActions';
import { personLinkRefusals } from '$lib/data/personLinkRules';
import { noteBodyRefusal } from '$lib/data/personNoteRules';
import type { McpCaller } from '../resolveMcpCaller';

const samId = '11111111-1111-4111-8111-111111111111';
const unknownId = '22222222-2222-4222-8222-222222222222';
const siteLinkId = '33333333-3333-4333-8333-333333333333';
const strangersLinkId = '44444444-4444-4444-8444-444444444444';

const { linkKept, linkDropped, noteKept } = vi.hoisted(() => ({ linkKept: vi.fn(), linkDropped: vi.fn(), noteKept: vi.fn() }));

const sam = {
	id: samId,
	name: 'Sam Rivers',
	links: [{ id: siteLinkId, personId: samId, label: 'Company site', url: 'https://rivers.example' }],
	notes: []
};

vi.mock('$lib/server/people/getPerson', () => ({
	getPerson: async (_supabase: unknown, personId: string) => (personId === samId ? sam : null)
}));
vi.mock('$lib/server/people/addPersonLink', () => ({ addPersonLink: linkKept }));
vi.mock('$lib/server/people/removePersonLink', () => ({ removePersonLink: linkDropped }));
vi.mock('$lib/server/people/addPersonNote', () => ({ addPersonNote: noteKept }));

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

function run(name: string, input: Record<string, unknown>) {
	const action = personLinkActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('links and notes on a person through the connector', () => {
	beforeEach(() => vi.clearAllMocks());

	it('keeps a new link on the person and says so', async () => {
		expect(await run('add_person_link', { personId: samId, label: 'Interview, 2025', url: 'https://press.example/sam' })).toBe(
			"Interview, 2025 is kept on Sam Rivers's record."
		);
		expect(linkKept).toHaveBeenCalledWith(staff.supabase, samId, { label: 'Interview, 2025', url: 'https://press.example/sam' });
	});

	it('does not keep a page already on their record twice', async () => {
		expect(await run('add_person_link', { personId: samId, label: 'Site', url: 'https://rivers.example' })).toBe(
			"https://rivers.example is already on Sam Rivers's record."
		);
		expect(linkKept).not.toHaveBeenCalled();
	});

	it('refuses a link that does not fit, or a person nobody has, before writing', async () => {
		expect(await run('add_person_link', { personId: samId, label: 'Site', url: 'rivers.example' })).toBe(personLinkRefusals.url);
		expect(await run('add_person_link', { personId: unknownId, label: 'Site', url: 'https://rivers.example' })).toBe(noSuchPerson);
		expect(linkKept).not.toHaveBeenCalled();
	});

	it('takes a link off the person only when the link is theirs', async () => {
		expect(await run('remove_person_link', { personId: samId, linkId: siteLinkId })).toBe("Company site is off Sam Rivers's record.");
		expect(linkDropped).toHaveBeenCalledWith(staff.supabase, siteLinkId);
		expect(await run('remove_person_link', { personId: samId, linkId: strangersLinkId })).toContain('No link with that id');
		expect(linkDropped).toHaveBeenCalledTimes(1);
	});

	it('adds a note under the staff member who wrote it', async () => {
		expect(await run('add_person_note', { personId: samId, body: ' Met at the trade show. ' })).toBe(
			"The note is on Sam Rivers's record under your name."
		);
		expect(noteKept).toHaveBeenCalledWith(staff.supabase, samId, 'note', 'Met at the trade show.', 'staff-1');
		expect(await run('add_person_note', { personId: samId, body: '  ' })).toBe(noteBodyRefusal);
		expect(noteKept).toHaveBeenCalledTimes(1);
	});
});
