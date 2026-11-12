import { formatBritishDate } from '$lib/data/britishDate';
import type { AccountOnRegister } from '$lib/server/admin/accountOnRegister';

export const noSuchAccount = 'No account has that email address. Call list_accounts to see them.';
const accountHolder = 'account holder';

/** Every account as the admin page lists it, newest first: the email, the badges its row carries, and when it joined. */
export function describeAccountRegister(accounts: AccountOnRegister[]): string {
	return accounts.map(describeAccountLine).join('\n');
}

export function describeStanding(account: AccountOnRegister): string {
	const badges = [account.isAdmin ? 'admin' : null, account.isStaff ? 'staff' : null, account.isRestricted ? 'restricted' : null];
	const worn = badges.filter((badge) => badge !== null);
	return worn.length === 0 ? accountHolder : worn.join(', ');
}

function describeAccountLine(account: AccountOnRegister): string {
	return `${account.email} — ${describeStanding(account)} — joined ${formatBritishDate(account.joinedAt)} — account ${account.id}`;
}
