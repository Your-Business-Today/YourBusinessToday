import { validateRecordId } from '$lib/data/isUuid';
import { validateMoney } from './moneyColumn';

/** One line of a journal: an amount on one side of one account, perhaps within a cost centre. */
export type JournalLineInput = {
	accountId: string;
	costCentreId: string | null;
	debit: number;
	credit: number;
};

export type JournalLineFields = {
	accountId?: unknown;
	costCentreId?: unknown;
	debit?: unknown;
	credit?: unknown;
};

/** The line as given, or why it is refused, naming the line and the field. */
export function validateJournalLine(fields: JournalLineFields, lineNumber: number): JournalLineInput | string {
	const name = `Line ${lineNumber}`;
	const idRefusal = lineIdRefusal(fields, name);
	if (idRefusal !== null) return idRefusal;
	const debit = validateMoney(`${name} debit`, fields.debit ?? 0);
	if (typeof debit === 'string') return debit;
	const credit = validateMoney(`${name} credit`, fields.credit ?? 0);
	if (typeof credit === 'string') return credit;
	const sidesWithMoney = [debit, credit].filter((amount) => amount !== 0).length;
	if (sidesWithMoney !== 1) return `${name} has a debit or a credit, not both and not neither.`;
	const costCentreId = (fields.costCentreId ?? null) as string | null;
	return { accountId: fields.accountId as string, costCentreId, debit, credit };
}

function lineIdRefusal(fields: JournalLineFields, name: string): string | null {
	const accountRefusal = validateRecordId(`${name} account`, String(fields.accountId ?? ''));
	if (accountRefusal !== null) return accountRefusal;
	const hasCostCentre = fields.costCentreId !== undefined && fields.costCentreId !== null;
	if (!hasCostCentre) return null;
	return validateRecordId(`${name} cost centre`, String(fields.costCentreId));
}
