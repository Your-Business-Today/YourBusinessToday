import type { SupabaseClient } from '@supabase/supabase-js';
import { closedLoanAccountRefusal, owedCostRefusal } from '$lib/data/books/loans/partnerPaidCostRules';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { refuseWhen } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { costMoveWords } from './costSteps';
import type { Expense } from './expenses';
import { isJournalPosted } from './journalStep';
import { findLoanAccount, type LoanAccount } from './loanAccounts';
import { expenseStepInputs, prepareExpense } from './recordExpense';

/** A cost a person paid from their own pocket, as the books keep it, with the loan account its payment credits. */
export type PersonallyPaidExpense = { recorded: Expense; loan: LoanAccount };

const recordStep = 'record_books_expense_paid_by_loan_account';

/**
 * Records a company cost that one person paid from their own pocket on the day it is dated: kept as a cost like any
 * other, paid that day, debited to the account it is coded to and credited to the person's loan account in place of the
 * bank, so the company owes them the cost. A loan account that is closed or belongs to other books is refused, and so
 * is a cost recorded as still owed. The cost, its journal and who paid it are written in one step of the database.
 */
export async function recordExpensePaidPersonally(
	supabase: SupabaseClient,
	organisationId: string,
	fields: Record<string, unknown>
): Promise<PersonallyPaidExpense> {
	refuseWhen(owedCostRefusal(fields.isPaid));
	const loan = await findLoanAccount(supabase, organisationId, fields.paidByLoanAccountId);
	refuseWhen(closedLoanAccountRefusal(loan));
	const prepared = await prepareExpense(supabase, organisationId, fields, loan.accountId);
	const { journal } = prepared;
	const recorded = { ...prepared.recorded, paidByLoanAccountId: loan.id };
	await runBooksStep(supabase, {
		name: recordStep,
		inputs: { ...expenseStepInputs(organisationId, prepared), paying_loan_account_id: loan.id },
		hasHappened: () => isJournalPosted(supabase, organisationId, journal.id),
		...costMoveWords(recorded.supplier, `recorded for ${formatPoundsAndPence(recorded.amount)}, paid by ${loan.personName}`)
	});
	return { recorded, loan };
}
