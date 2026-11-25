import { LoanBudgetLimits } from '$lib/data/books/loanBudget/loanBudget';
import { textField } from '../actionTypes';

const { longestTitle, longestName, longestText, mostRepaymentMonths } = LoanBudgetLimits;

const keepWhatIsThere = '; leave out to keep what is there';

const amountField = (description: string) => ({ type: ['number', 'string'], description });

export const loanBudgetIdField = textField('The loan budget, by its id as read_loan_budgets gives it');

export const budgetLineIdField = textField('The budget line, by its id as read_loan_budgets gives it');

function budgetFields(suffix: string) {
	return {
		title: textField(`What the loan is called, at most ${longestTitle} characters, such as Start Up Loan${suffix}`),
		loanAmount: amountField(`How much the loan is, in pounds, such as 20000${suffix}`),
		repaidTo: textField(`Who the company repays, by name, at most ${longestName} characters, such as Jeremy Ferendinos${suffix}`),
		monthlyRepayment: amountField(`What the company repays each month, in pounds, such as 400.76${suffix}`),
		firstRepaymentMonth: textField(`The first month a repayment is made, written as 2026-12${suffix}`),
		repaymentMonths: { type: 'integer', description: `How many monthly repayments there are, 1 to ${mostRepaymentMonths}${suffix}` },
		notes: textField(`The repayment rules or anything else the directors agreed, at most ${longestText} characters${suffix}`)
	};
}

function lineFields(suffix: string) {
	return {
		purpose: textField(`What this part of the loan is spent on, at most ${longestTitle} characters${suffix}`),
		amount: amountField(`How much of the loan it may spend, in pounds${suffix}`),
		expectedReturn: textField(`The return it is expected to bring, in the directors' words, at most ${longestText} characters${suffix}`)
	};
}

export const newLoanBudgetFields = budgetFields('');

export const loanBudgetChangeFields = { loanBudgetId: loanBudgetIdField, ...budgetFields(keepWhatIsThere) };

export const newLoanDrawFields = {
	loanBudgetId: loanBudgetIdField,
	month: textField('The month the part of the loan is drawn into the bank, written as 2026-12'),
	amount: amountField('How much is drawn, in pounds')
};

export const newBudgetLineFields = { loanBudgetId: loanBudgetIdField, ...lineFields('') };

export const budgetLineChangeFields = { budgetLineId: budgetLineIdField, ...lineFields(keepWhatIsThere) };

export const newLoanSpendFields = {
	budgetLineId: textField('The approved budget line the money was spent from, by its id as read_loan_budgets gives it'),
	spentOn: textField('The day the money was spent, written as 2026-12-03'),
	amount: amountField('How much was spent, in pounds'),
	description: textField(`What the money was spent on, at most ${longestTitle} characters, such as Two laptops from Dell`),
	expenseId: textField('The cost in the books this spend matches, by its id as list_expenses gives it; leave out when there is none')
};
