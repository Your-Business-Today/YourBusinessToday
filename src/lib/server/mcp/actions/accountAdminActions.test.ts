import { beforeEach, describe, expect, it, vi } from 'vitest';
import { accountAdminActions } from './accountAdminActions';
import { noSuchAccount } from './describeAccountRegister';
import type { McpCaller } from '../resolveMcpCaller';

const jamesId = '11111111-1111-4111-8111-111111111111';
const samId = '22222222-2222-4222-8222-222222222222';
const admin = { accountId: jamesId, isAdmin: true, isStaff: true, supabase: {} } as unknown as McpCaller;

const { register, staffSet, restrictionSet, resetSent, accountDeleted } = vi.hoisted(() => ({
	register: { accounts: [] as { email: string }[] },
	staffSet: vi.fn(),
	restrictionSet: vi.fn(),
	resetSent: vi.fn(),
	accountDeleted: vi.fn()
}));

vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/admin/listEveryAccount', () => ({ listEveryAccount: async () => register.accounts }));
vi.mock('$lib/server/admin/findAccountStanding', () => ({
	findAccountStanding: async (_supabase: unknown, email: string) => register.accounts.find((account) => account.email === email) ?? null
}));
vi.mock('$lib/server/admin/setAccountStanding', () => ({ setStaffAccessFor: staffSet, setAccountRestrictionFor: restrictionSet }));
vi.mock('$lib/server/admin/sendUserPasswordReset', () => ({ sendUserPasswordReset: resetSent }));
vi.mock('$lib/server/admin/deleteAccountFor', () => ({ deleteAccountFor: accountDeleted }));

const james = { id: jamesId, email: 'james@example.com', isAdmin: true, isStaff: true, isRestricted: false, joinedAt: '2026-01-05T09:00:00Z' };
const sam = { id: samId, email: 'sam@example.com', isAdmin: false, isStaff: false, isRestricted: true, joinedAt: '2026-11-02T09:00:00Z' };

function run(name: string, input: Record<string, unknown>) {
	const action = accountAdminActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(admin, input);
}

describe('the accounts register through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		register.accounts = [sam, james];
	});

	it('lists every account with its standing, as the admin page does', async () => {
		expect(await run('list_accounts', {})).toBe(
			`sam@example.com — restricted — joined 2 Nov 2026 — account ${samId}\njames@example.com — admin, staff — joined 5 Jan 2026 — account ${jamesId}`
		);
		expect(accountAdminActions.every((action) => action.audience === 'admin')).toBe(true);
	});

	it('makes an account staff or not, and restricts or unrestricts it', async () => {
		expect(await run('set_staff_access', { email: 'sam@example.com', isStaff: true })).toBe('sam@example.com is now staff.');
		expect(staffSet).toHaveBeenCalledWith(admin.supabase, samId, true);
		expect(await run('set_account_restriction', { email: 'sam@example.com', isRestricted: false })).toBe('sam@example.com is now unrestricted.');
		expect(restrictionSet).toHaveBeenCalledWith(admin.supabase, samId, false);
		expect(await run('set_staff_access', { email: 'sam@example.com', isStaff: 'yes' })).toBe('Say with isStaff true or false.');
		expect(staffSet).toHaveBeenCalledTimes(1);
	});

	it('refuses an address that is not one, or that nobody has, before writing', async () => {
		expect(await run('set_staff_access', { email: 'sam', isStaff: true })).toContain('must be an email address');
		expect(await run('set_staff_access', { email: 'nobody@example.com', isStaff: true })).toBe(noSuchAccount);
		expect(staffSet).not.toHaveBeenCalled();
	});

	it('emails a password reset and says how it went', async () => {
		resetSent.mockResolvedValue('sent');
		expect(await run('send_password_reset', { email: 'sam@example.com' })).toBe('sam@example.com has been emailed a link to set a new password.');
		expect(resetSent).toHaveBeenCalledWith('sam@example.com', 'https://portal.yourbusiness.today');
		resetSent.mockResolvedValue('skipped');
		expect(await run('send_password_reset', { email: 'sam@example.com' })).toContain('email is not configured');
	});

	it('deletes an account, but never an admin or an owner of team data', async () => {
		expect(await run('delete_account', { email: 'sam@example.com' })).toBe('sam@example.com (restricted) has been deleted.');
		expect(accountDeleted).toHaveBeenCalledWith(admin.supabase, samId);
		expect(await run('delete_account', { email: 'james@example.com' })).toContain('admin accounts and accounts that own team data are protected');
		accountDeleted.mockRejectedValue(new Error('foreign key'));
		expect(await run('delete_account', { email: 'sam@example.com' })).toContain('could not be deleted');
		expect(accountDeleted).toHaveBeenCalledTimes(2);
	});
});
