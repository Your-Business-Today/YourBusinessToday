import { deleteAccountFor } from '$lib/server/admin/deleteAccountFor';
import { describeAccountRegister, describeStanding, noSuchAccount } from './describeAccountRegister';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import { findAccountStanding } from '$lib/server/admin/findAccountStanding';
import { listEveryAccount } from '$lib/server/admin/listEveryAccount';
import { objectSchema, readText, textField } from '../actionTypes';
import { portalAddress } from '$lib/portal/portalAddress';
import { sendUserPasswordReset } from '$lib/server/admin/sendUserPasswordReset';
import { setAccountRestrictionFor, setStaffAccessFor } from '$lib/server/admin/setAccountStanding';
import { validateEmailAddress } from '$lib/data/emailShape';
import type { AccountOnRegister } from '$lib/server/admin/accountOnRegister';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type AccountChange = (caller: McpCaller, account: AccountOnRegister, input: Record<string, unknown>) => Promise<string>;

const emailField = textField('Their email address, as list_accounts gives it');
const yesOrNo = (field: string) => `Say with ${field} true or false.`;
const noAccountOutcome = 'no_account';
const adminsAreProtected = 'could not be deleted — admin accounts and accounts that own team data are protected.';
const resetOutcomes: Record<EmailDelivery, string> = {
	sent: 'has been emailed a link to set a new password.',
	skipped: 'was not emailed — email is not configured.',
	failed: 'could not be emailed — try again later.'
};

export const accountAdminActions: McpAction[] = [
	{
		name: 'list_accounts',
		area: 'account',
		audience: 'admin',
		isWrite: false,
		summary: 'every account here with its standing — admin, staff, restricted — newest first, as the admin page lists them',
		inputSchema: objectSchema({}),
		run: async (caller) => describeAccountRegister(await listEveryAccount(caller.supabase))
	},
	adminAction('set_staff_access', 'make an account staff, or no longer staff', { isStaff: { type: 'boolean', description: 'True to make them staff' } }, setStaff),
	adminAction('set_account_restriction', 'restrict an account so it can no longer sign in or connect, or lift the restriction', { isRestricted: { type: 'boolean', description: 'True to restrict them' } }, setRestriction),
	adminAction('send_password_reset', 'email someone a one-time link to set a new password', {}, sendReset),
	adminAction('delete_account', 'delete an account and all of its own data outright — admin accounts and accounts that own team data are protected', {}, deleteAccount)
];

function adminAction(name: string, summary: string, fields: Record<string, unknown>, change: AccountChange): McpAction {
	const required = ['email', ...Object.keys(fields)];
	return {
		name,
		area: 'account',
		audience: 'admin',
		isWrite: true,
		summary,
		inputSchema: objectSchema({ email: emailField, ...fields }, required),
		run: async (caller, input) => changeAccount(caller, input, change)
	};
}

async function changeAccount(caller: McpCaller, input: Record<string, unknown>, change: AccountChange): Promise<string> {
	const email = readText(input, 'email');
	const emailRefusal = validateEmailAddress('email', email);
	if (emailRefusal !== null) return emailRefusal;
	const account = await findAccountStanding(caller.supabase, email);
	if (account === null) return noSuchAccount;
	return change(caller, account, input);
}

async function setStaff(caller: McpCaller, account: AccountOnRegister, input: Record<string, unknown>): Promise<string> {
	if (typeof input.isStaff !== 'boolean') return yesOrNo('isStaff');
	await setStaffAccessFor(caller.supabase, account.id, input.isStaff);
	return `${account.email} is ${input.isStaff ? 'now staff' : 'no longer staff'}.`;
}

async function setRestriction(caller: McpCaller, account: AccountOnRegister, input: Record<string, unknown>): Promise<string> {
	if (typeof input.isRestricted !== 'boolean') return yesOrNo('isRestricted');
	await setAccountRestrictionFor(caller.supabase, account.id, input.isRestricted);
	return `${account.email} is now ${input.isRestricted ? 'restricted' : 'unrestricted'}.`;
}

async function sendReset(_caller: McpCaller, account: AccountOnRegister): Promise<string> {
	const outcome = await sendUserPasswordReset(account.email, portalAddress.origin);
	if (outcome === noAccountOutcome) return noSuchAccount;
	return `${account.email} ${resetOutcomes[outcome]}`;
}

async function deleteAccount(caller: McpCaller, account: AccountOnRegister): Promise<string> {
	if (account.isAdmin) return `${account.email} ${adminsAreProtected}`;
	try {
		await deleteAccountFor(caller.supabase, account.id);
	} catch {
		return `${account.email} ${adminsAreProtected}`;
	}
	return `${account.email} (${describeStanding(account)}) has been deleted.`;
}
