import { feedKindOfFiling, filingKindLabels, filingKindOf, filingKinds, type FilingKind } from '$lib/data/filingKinds';
import { formatBritishDate } from '$lib/data/britishDate';
import type { AreaEventKind } from '$lib/data/areaEventKind';

/** One filing as the feed and the panel name it: what it is, when, the form, and one sentence a person reads. */
export type ClassifiedFiling = {
	transactionId: string;
	filedOn: string;
	formType: string;
	kind: FilingKind;
	feedKind: AreaEventKind;
	sentence: string;
	madeUpTo: string;
};

export function parseFilingHistory(body: Record<string, unknown>): ClassifiedFiling[] {
	const items = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
	return items.map(classifyFiling).filter((filing) => filing.transactionId !== '');
}

export function classifyFiling(item: Record<string, unknown>): ClassifiedFiling {
	const descriptionId = String(item.description ?? '');
	const kind = filingKindOf(descriptionId);
	const values = (item.description_values ?? {}) as Record<string, unknown>;
	const formType = String(item.type ?? '');
	const madeUpTo = String(values.made_up_date ?? '');
	return {
		transactionId: String(item.transaction_id ?? ''),
		filedOn: String(item.date ?? ''),
		formType,
		kind,
		feedKind: feedKindOfFiling[kind],
		sentence: sentenceOf(kind, descriptionId, values, formType),
		madeUpTo
	};
}

const accountsTypeIn = /^accounts-with-accounts-type-(.+)$/;

type SentenceValues = Record<string, unknown>;

/** The sentence shape per kind: the plain label for most, the detail the description values carry for a few. */
const sentenceShapes: Partial<Record<FilingKind, (descriptionId: string, values: SentenceValues) => string>> = {
	[filingKinds.accounts]: (descriptionId, values) => `${accountsTypeWords(descriptionId)} accounts${madeUpToWords(values)}`,
	[filingKinds.confirmationStatement]: (_descriptionId, values) => `Confirmation statement${madeUpToWords(values)}`,
	[filingKinds.officerAppointed]: (_descriptionId, values) => `${filingKindLabels.officer_appointed}: ${String(values.officer_name ?? 'an officer')}`,
	[filingKinds.officerResigned]: (_descriptionId, values) => `${filingKindLabels.officer_resigned}: ${String(values.officer_name ?? 'an officer')}`,
	[filingKinds.officeMoved]: (_descriptionId, values) => `${filingKindLabels.office_moved} to ${String(values.new_address ?? 'a new address')}`,
	[filingKinds.nameChange]: (_descriptionId, values) => `${filingKindLabels.name_change} to ${String(values.new_name ?? 'a new name')}`
};

function sentenceOf(kind: FilingKind, descriptionId: string, values: SentenceValues, formType: string): string {
	const form = formType === '' ? '' : ` (${formType})`;
	const shape = sentenceShapes[kind];
	const words = shape === undefined ? filingKindLabels[kind] : shape(descriptionId, values);
	return `${words}${form}`;
}

function madeUpToWords(values: SentenceValues): string {
	const madeUpTo = String(values.made_up_date ?? '');
	return madeUpTo === '' ? '' : ` to ${formatBritishDate(madeUpTo)}`;
}

/** "micro-entity" becomes "Micro-entity"; "total-exemption-full" becomes "Total exemption full". */
function accountsTypeWords(descriptionId: string): string {
	const type = accountsTypeIn.exec(descriptionId)?.[1] ?? 'filed';
	const words = type.replace(/-/g, ' ').replace(/^micro entity/, 'micro-entity');
	return words.charAt(0).toUpperCase() + words.slice(1);
}
