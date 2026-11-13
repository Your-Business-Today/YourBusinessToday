import { LoanAccountLimits, relationshipList } from '$lib/data/books/loans/loanAccountRules';
import { LoanAccountCodes } from '$lib/data/books/loans/nextLoanAccountCode';
import { textField } from '../actionTypes';

export const newLoanAccountFields = {
	personName: textField(
		`Whose loan account it is, by their full name as the person gave it, at most ${LoanAccountLimits.personNameLongest} characters`
	),
	relationship: textField(`How they stand to the company: one of ${relationshipList}`),
	accountCode: textField(
		`Leave out for the books to add a liability account at the next free code from ${LoanAccountCodes.first}, or the code of a ` +
			"liability account already in the chart that holds this person's loan, such as 2300"
	)
};

export const loanAccountIdField = textField('The loan account, by its id as list_loan_accounts gives it');
