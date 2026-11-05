import { findAccountByEmail } from '$lib/server/accounts/findAccountByEmail';
import { isEmailShaped } from '$lib/data/emailShape';
import { getLoginsOfPeople, linkLogin, unlinkLogin, type PersonLogins } from '$lib/server/owed/linkedLogins';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const personEmailField = textField('The email of the person’s main login — the one whose name they go by');
const loginEmailField = textField('The email of their other login, to count as the same person');
const noSuchLogin = (email: string) => `No one signs in as ${email}. Check the address with list_project_people.`;
const sameLogin = 'Those are the same login: give the main login and a different one.';
const stillMain = (email: string) =>
	`${email} is the main login of someone else's other logins. Unlink those first with unlink_person.`;

export const linkPersonActions: McpAction[] = [
	{
		name: 'link_person',
		area: 'account',
		audience: 'staff',
		isWrite: true,
		summary: 'count two logins as one person, so what they owe is one list and who to chase names them once',
		guidance:
			'Use it when one person signs in with more than one login, as Jeremy did on 5 Nov 2026. ' +
			'Everything waiting on, assigned to or promised by either login then shows in their own ' +
			'summary and once under their name in who to chase. unlink_person undoes it.',
		inputSchema: objectSchema({ personEmail: personEmailField, loginEmail: loginEmailField }, ['personEmail', 'loginEmail']),
		run: async (caller, input) => linkPerson(caller, readText(input, 'personEmail'), readText(input, 'loginEmail'))
	},
	{
		name: 'unlink_person',
		area: 'account',
		audience: 'staff',
		isWrite: true,
		summary: 'make a login linked with link_person stand on its own again',
		inputSchema: objectSchema({ loginEmail: textField('The email of the login to stand on its own') }, ['loginEmail']),
		run: async (caller, input) => unlinkPerson(caller, readText(input, 'loginEmail'))
	}
];

async function linkPerson(caller: McpCaller, personEmail: string, loginEmail: string): Promise<string> {
	const refusal = validateLoginEmails([personEmail, loginEmail]);
	if (refusal !== null) return refusal;
	const { supabase, accountId } = caller;
	const [person, login] = await Promise.all([findAccountByEmail(supabase, personEmail), findAccountByEmail(supabase, loginEmail)]);
	if (person === null) return noSuchLogin(personEmail);
	if (login === null) return noSuchLogin(loginEmail);
	const loginsByAccount = await getLoginsOfPeople(supabase, [person.id, login.id]);
	const { personAccountId: mainId, accountIds } = loginsByAccount.get(person.id) ?? loginsOfOne(person.id);
	if (mainId === login.id) return sameLogin;
	const loginLogins = loginsByAccount.get(login.id) ?? loginsOfOne(login.id);
	if (isMainOfOthers(loginLogins, login.id)) return stillMain(loginEmail);
	await linkLogin(supabase, login.id, mainId, accountId);
	const loginCount = accountIds.length + 1;
	return `${loginEmail} now counts as ${personEmail}: one person with ${loginCount} logins.`;
}

function loginsOfOne(accountId: string): PersonLogins {
	return { personAccountId: accountId, accountIds: [accountId] };
}

function isMainOfOthers(logins: PersonLogins, accountId: string): boolean {
	const { personAccountId, accountIds } = logins;
	return personAccountId === accountId && accountIds.length > 1;
}

/** Why the addresses cannot name a login, or null when each has the shape of an email address. */
function validateLoginEmails(emails: string[]): string | null {
	const misshapen = emails.find((email) => !isEmailShaped(email));
	if (misshapen === undefined) return null;
	return `"${misshapen}" is not an email address: give the address the login signs in with.`;
}

async function unlinkPerson(caller: McpCaller, loginEmail: string): Promise<string> {
	const refusal = validateLoginEmails([loginEmail]);
	if (refusal !== null) return refusal;
	const login = await findAccountByEmail(caller.supabase, loginEmail);
	if (login === null) return noSuchLogin(loginEmail);
	await unlinkLogin(caller.supabase, login.id);
	return `${loginEmail} stands on its own again.`;
}
