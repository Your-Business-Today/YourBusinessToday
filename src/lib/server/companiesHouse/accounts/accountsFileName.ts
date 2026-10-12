/** What a member's name in the daily accounts zip says: Prod223_3456_12345678_20260331.html. */
export type AccountsFiling = { memberName: string; companyNumber: string; madeUpTo: string };

const memberNameShape = /^Prod(\d+)_(\d+)_([A-Z0-9]{8})_(\d{4})(\d{2})(\d{2})(?:_CIC)?\.(?:html|xml|zip)$/i;

export function parseAccountsFileName(memberName: string): AccountsFiling | null {
	const match = memberNameShape.exec(memberName);
	if (match === null) return null;
	const [, , , companyNumber, year, month, day] = match;
	return { memberName, companyNumber: companyNumber.toUpperCase(), madeUpTo: `${year}-${month}-${day}` };
}
