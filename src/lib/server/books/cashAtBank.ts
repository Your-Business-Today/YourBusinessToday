import type { SupabaseClient } from '@supabase/supabase-js';
import { fromPence, toPence } from '$lib/data/books/money';
import { findBankAccountSides } from './bankAccountSides';
import { findStatementAccountIfHeld } from './bankStatementAccount';

const theBooksBankAccount = undefined;
const noCash = 0;

/** What the books' Bank account holds at the end of the day: money in less money out, nothing while the books keep no Bank account. */
export async function cashAtBankOn(supabase: SupabaseClient, organisationId: string, throughDate: string): Promise<number> {
	const account = await findStatementAccountIfHeld(supabase, organisationId, theBooksBankAccount);
	if (account === null) return noCash;
	const sides = await findBankAccountSides(supabase, organisationId, account.id, throughDate);
	return fromPence(sides.reduce((total, side) => total + toPence(side.debit) - toPence(side.credit), noCash));
}
