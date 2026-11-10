const nothing = 0;

/** A column with nothing in it shows blank rather than £0.00, as a ledger's debit and credit columns do. */
export function amountOrBlank(amount: number): number | null {
	const isNothing = amount === nothing;
	return isNothing ? null : amount;
}
