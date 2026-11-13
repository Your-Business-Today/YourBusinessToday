import { plainTextRefusal } from '../chartRules';

/** How a loan account's person stands to the company: the relationship values books_loan_accounts accepts (migration 0217). */
export const LoanRelationships = {
	director: 'director',
	shareholder: 'shareholder',
	other: 'other'
} as const;

export type LoanRelationship = (typeof LoanRelationships)[keyof typeof LoanRelationships];

/** The limits of books_loan_accounts' columns, stated once for the service and the connector's fields. */
export const LoanAccountLimits = { personNameLongest: 120 } as const;

/** A loan account a person opens: whose it is, how they stand, and the chart's account it is kept on, or null for a new one. */
export type NewLoanAccount = {
	personName: string;
	relationship: LoanRelationship;
	accountCode: string | null;
};

const everyRelationship = Object.values(LoanRelationships) as LoanRelationship[];

export const relationshipList = everyRelationship.join(', ');

/** The loan account as given, or the first reason it cannot be kept: never trimmed, shortened or filled in. */
export function validateNewLoanAccount(fields: Record<string, unknown>): NewLoanAccount | string {
	const refusal = personNameRefusal(fields.personName) ?? relationshipRefusal(fields.relationship) ?? accountCodeRefusal(fields.accountCode);
	if (refusal !== null) return refusal;
	return {
		personName: fields.personName as string,
		relationship: fields.relationship as LoanRelationship,
		accountCode: isLeftOut(fields.accountCode) ? null : (fields.accountCode as string)
	};
}

function personNameRefusal(personName: unknown): string | null {
	const textRefusal = plainTextRefusal('personName', personName);
	if (textRefusal !== null) return textRefusal;
	const length = (personName as string).length;
	if (length <= LoanAccountLimits.personNameLongest) return null;
	return `personName is at most ${LoanAccountLimits.personNameLongest} characters; ${length} were given.`;
}

function relationshipRefusal(relationship: unknown): string | null {
	if (everyRelationship.includes(relationship as LoanRelationship)) return null;
	return `relationship is one of ${relationshipList}; ${JSON.stringify(relationship)} was given.`;
}

function accountCodeRefusal(accountCode: unknown): string | null {
	if (isLeftOut(accountCode)) return null;
	return plainTextRefusal('accountCode', accountCode);
}

function isLeftOut(value: unknown): boolean {
	return value === undefined || value === null;
}
