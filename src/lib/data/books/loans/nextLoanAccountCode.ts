/** Where the books put a new loan account when the person names no code: 2300, 2310 and on, up to 2390. */
export const LoanAccountCodes = { first: 2300, step: 10, last: 2390 } as const;

/** The first loan account code from 2300 the chart does not already hold, or null when all ten are taken. */
export function nextLoanAccountCode(heldCodes: string[]): string | null {
	const held = new Set(heldCodes);
	for (let code = LoanAccountCodes.first; code <= LoanAccountCodes.last; code += LoanAccountCodes.step) {
		const candidate = String(code);
		if (!held.has(candidate)) return candidate;
	}
	return null;
}

/** The name the books give a loan account they add to the chart. */
export function loanAccountName(personName: string): string {
	return `Loan account: ${personName}`;
}
