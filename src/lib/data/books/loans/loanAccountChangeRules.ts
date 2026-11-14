import { personNameRefusal, relationshipRefusal, type LoanRelationship } from './loanAccountRules';

/** A correction to a loan account: any of the person's name, how they stand to the company, and whether it is closed. */
export type LoanAccountChange = {
	personName?: string;
	relationship?: LoanRelationship;
	isClosed?: boolean;
};

type ChangeName = keyof LoanAccountChange;

const changeRules: Record<ChangeName, (candidate: unknown) => string | null> = {
	personName: personNameRefusal,
	relationship: relationshipRefusal,
	isClosed: closedChoiceRefusal
};

const changeNames = Object.keys(changeRules) as ChangeName[];

export const nothingToChange = 'Give at least one of personName, relationship or isClosed to change; none was given.';

/** The change as given, or the first reason it cannot be kept: never trimmed or filled in, and what is left out stays as it is. */
export function validateLoanAccountChange(fields: Record<string, unknown>): LoanAccountChange | string {
	const givenNames = changeNames.filter((name) => fields[name] !== undefined);
	if (givenNames.length === 0) return nothingToChange;
	const refusals = givenNames.map((name) => changeRules[name](fields[name])).filter((refusal): refusal is string => refusal !== null);
	if (refusals.length > 0) return refusals[0];
	return Object.fromEntries(givenNames.map((name) => [name, fields[name]])) as LoanAccountChange;
}

function closedChoiceRefusal(candidate: unknown): string | null {
	if (typeof candidate === 'boolean') return null;
	return `isClosed is true or false; ${JSON.stringify(candidate)} was given.`;
}
