import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nobodyListedYet } from './describePortalPeople';
import { notAnAdministrator } from '../portalVisitorAccess';
import { portalPeopleActions } from './portalPeopleActions';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const stuartId = '44444444-4444-4444-8444-444444444444';
const contact = { accountId: 'contact-1', supabase: {} } as unknown as McpCaller;

const { portal, inviting, removing, administering } = vi.hoisted(() => ({
	portal: { visitor: null as Record<string, unknown> | null, people: [] as unknown[] },
	inviting: vi.fn(),
	removing: vi.fn(),
	administering: vi.fn()
}));

vi.mock('$lib/server/portal/getPortalVisitor', () => ({ getPortalVisitor: async () => portal.visitor }));
vi.mock('$lib/server/portal/getPortalPeople', () => ({ getPortalPeople: async () => portal.people }));
vi.mock('$lib/server/portal/invitePortalPerson', () => ({ invitePortalPerson: inviting }));
vi.mock('$lib/server/portal/removePortalPerson', () => ({ removePortalPerson: removing }));
vi.mock('$lib/server/portal/setPortalAdministrator', () => ({ setPortalAdministrator: administering }));

const administrator = {
	contactId: 'contact-row-1',
	isAdministrator: true,
	personName: 'Dana',
	emailAddress: 'dana@acme.example',
	role: 'Director',
	clientId: acmeId,
	organisationName: 'Acme Ltd',
	organisations: [{ clientId: acmeId, name: 'Acme Ltd' }]
};
const dana = { contactId: 'contact-row-1', name: 'Dana', email: 'dana@acme.example', role: 'Director', isAdministrator: true, access: 'signed_in' };
const stuart = { contactId: stuartId, name: 'Stuart', email: 'stuart@acme.example', role: '', isAdministrator: false, access: 'invited' };

function run(name: string, input: Record<string, unknown> = {}) {
	const action = portalPeopleActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(contact, input);
}

describe("a client organisation's people through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		portal.visitor = administrator;
		portal.people = [dana, stuart];
		inviting.mockResolvedValue(null);
		removing.mockResolvedValue(null);
		administering.mockResolvedValue(null);
	});

	it('lists everyone as the People page does', async () => {
		expect(await run('list_portal_people')).toBe(
			[
				`For Acme Ltd (clientId ${acmeId}).`,
				'Dana — Director — dana@acme.example — administrator — Signed in — contact contact-row-1',
				`Stuart — stuart@acme.example — Invited, not signed in yet — contact ${stuartId}`
			].join('\n')
		);
		portal.people = [];
		expect(await run('list_portal_people')).toContain(nobodyListedYet);
	});

	it('invites a person as an administrator asks, checking them first', async () => {
		const answer = await run('invite_portal_person', { name: 'Jo', email: 'Jo@Acme.example', role: 'Finance', isAdministrator: true });
		expect(answer).toBe('Invitation sent to jo@acme.example.');
		expect(inviting).toHaveBeenCalledWith(administrator, { name: 'Jo', email: 'jo@acme.example', role: 'Finance', isAdministrator: true }, 'https://portal.yourbusiness.today', 'contact-1');
		expect(await run('invite_portal_person', { name: 'Jo', email: 'jo' })).toBe('Give an email address the invitation can go to.');
		inviting.mockResolvedValue({ refusal: 'That email address is already on your organisation’s list.' });
		expect(await run('invite_portal_person', { name: 'Jo', email: 'jo@acme.example' })).toContain('already on your organisation');
	});

	it('removes a person and changes who administers, keeping to the rules the page keeps', async () => {
		expect(await run('remove_portal_person', { contactId: stuartId })).toBe('Removed. They can no longer sign in to your portal.');
		expect(removing).toHaveBeenCalledWith(administrator, stuartId, 'contact-1');
		expect(await run('set_portal_administrator', { contactId: stuartId, isAdministrator: true })).toBe('Saved: they are now an administrator of your portal.');
		expect(administering).toHaveBeenCalledWith(administrator, { contactId: stuartId, isAdministrator: true }, 'contact-1');
		expect(await run('remove_portal_person', { contactId: 'stuart' })).toContain('contactId');
		administering.mockResolvedValue({ refusal: 'Your organisation needs at least one administrator.' });
		expect(await run('set_portal_administrator', { contactId: stuartId, isAdministrator: false })).toContain('at least one administrator');
	});

	it('lets only an administrator change the people, as the page does', async () => {
		portal.visitor = { ...administrator, isAdministrator: false };
		expect(await run('invite_portal_person', { name: 'Jo', email: 'jo@acme.example' })).toBe(notAnAdministrator);
		expect(await run('remove_portal_person', { contactId: stuartId })).toBe(notAnAdministrator);
		expect(await run('set_portal_administrator', { contactId: stuartId, isAdministrator: true })).toBe(notAnAdministrator);
		expect(inviting).not.toHaveBeenCalled();
		expect(await run('list_portal_people')).toContain('Dana');
	});
});
