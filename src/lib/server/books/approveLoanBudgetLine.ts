import type { SupabaseClient } from '@supabase/supabase-js';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import type { LoanBudgetLine } from '$lib/data/books/loanBudget/loanBudget';
import { approvalInWords } from '$lib/data/books/loanBudget/approvalInWords';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { BooksRefusal } from './booksRefusal';
import { LoanBudgetTables } from './loanBudgetRecord';
import { findLoanBudgetLine } from './loanBudgets';

/** Who is approving: the person's account, the only thing that makes them a director or not. */
export type Approver = { accountId: string };

/**
 * Approves a line of a loan budget in the name of the person approving, so the loan may be spent on it. Only a sitting
 * director of the organisation approves, and a line is approved once: a change to it takes the approval off again.
 */
export async function approveLoanBudgetLine(
	supabase: SupabaseClient,
	organisationId: string,
	lineId: unknown,
	approver: Approver
): Promise<LoanBudgetLine> {
	const { line } = await findLoanBudgetLine(supabase, organisationId, lineId);
	if (line.approval !== null) {
		throw new BooksRefusal(`${line.purpose} was already approved by ${approvalInWords(line.approval)}.`);
	}
	const seat = sittingSeatOf(await getDirectorsOfOrganisation(supabase, organisationId), approver.accountId);
	if (seat === null) throw new BooksRefusal('Only a sitting director of the organisation approves a budget line, and you are not named as one.');
	const approval = { approvedByName: seat.name, approvedAt: new Date().toISOString() };
	const columns = { approved_by_account_id: approver.accountId, approved_by_name: approval.approvedByName, approved_at: approval.approvedAt };
	const { error } = await supabase.from(LoanBudgetTables.lines).update(columns).eq('organisation_id', organisationId).eq('id', line.id).is('approved_at', null);
	if (error !== null) throw error;
	return { ...line, approval };
}
