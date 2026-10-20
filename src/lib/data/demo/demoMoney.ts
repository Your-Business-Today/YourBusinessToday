const britishLocale = 'en-GB';

export function pounds(amount: number): string {
	const digits = Number.isInteger(amount) ? 0 : 2;
	return `£${amount.toLocaleString(britishLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
