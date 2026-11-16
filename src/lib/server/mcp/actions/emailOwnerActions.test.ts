import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emailOwnerActions } from './emailOwnerActions';
import { nobodyWeHold } from './describeEmailOwners';
import type { EmailOwner } from '$lib/server/filedEmails/emailOwner';
import type { McpCaller } from '../resolveMcpCaller';

const { register, ownersRead } = vi.hoisted(() => ({ register: { owners: [] as EmailOwner[] }, ownersRead: vi.fn() }));

vi.mock('$lib/server/filedEmails/findRecordsForEmail', () => ({
	findRecordsForEmail: async (supabase: unknown, addresses: string[]) => {
		ownersRead(supabase, addresses);
		return register.owners;
	}
}));

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const acme = { id: 'client-acme', name: 'Acme Ltd', stage: 'lead' as const };

function findRecords(input: Record<string, unknown>) {
	const [action] = emailOwnerActions;
	return action.run(staff, input);
}

describe('find_records_for_email', () => {
	beforeEach(() => ownersRead.mockClear());

	it('answers each address on its own line, with the ids to file the email under', async () => {
		register.owners = [
			{ address: 'jo@acme.co.uk', kind: 'person', personId: 'person-jo', personName: 'Jo Bloggs', companies: [acme] },
			{ address: 'sam@gmail.com', kind: 'person', personId: 'person-sam', personName: 'Sam Rivers', companies: [] },
			{ address: 'accounts@acme.co.uk', kind: 'website', domain: 'acme.co.uk', companies: [acme] },
			{ address: 'consulting@yourbusiness.today', kind: 'us' },
			{ address: 'hello@stranger.example', kind: 'nobody' }
		];
		expect(await findRecords({ addresses: ['Jo@acme.co.uk'] })).toBe(
			'Who these 5 addresses belong to:\n' +
				'- jo@acme.co.uk — Jo Bloggs (person person-jo), a contact at Acme Ltd (Lead, client client-acme)\n' +
				'- sam@gmail.com — Sam Rivers (person person-sam), a contact at no client or lead yet\n' +
				'- accounts@acme.co.uk — no one we hold by this address, but acme.co.uk is the website of Acme Ltd (Lead, client client-acme)\n' +
				"- consulting@yourbusiness.today — us, an address of Your Business Today's own\n" +
				`- hello@stranger.example — ${nobodyWeHold}`
		);
		expect(ownersRead).toHaveBeenCalledWith(staff.supabase, ['jo@acme.co.uk']);
	});

	it('says one address in the singular', async () => {
		register.owners = [{ address: 'hello@stranger.example', kind: 'nobody' }];
		expect(await findRecords({ addresses: ['hello@stranger.example'] })).toBe(`Who this address belongs to:\n- hello@stranger.example — ${nobodyWeHold}`);
	});

	it('refuses an address that is not one by name, reading nothing', async () => {
		expect(await findRecords({ addresses: ['not an address'] })).toBe('addresses: "not an address" is not an email address, such as name@example.com.');
		expect(ownersRead).not.toHaveBeenCalled();
	});
});
