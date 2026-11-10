import { validateRecordId } from '$lib/data/isUuid';

/** What a deletion record can be of, as books_deletions.kind allows it. */
export const BooksDeletionKinds = { invoice: 'invoice', cost: 'cost' } as const;

export type BooksDeletionKind = (typeof BooksDeletionKinds)[keyof typeof BooksDeletionKinds];

/** A row of books_deletions as the server writes it, before the database gives it its id and its moment. */
export type BooksDeletionEntry = {
	organisationId: string;
	kind: BooksDeletionKind;
	recordId: string;
	knownAs: string;
	record: Record<string, unknown>;
	journals: Record<string, unknown>[];
	deletedByAccountId: string;
};

const deletionKinds: string[] = Object.values(BooksDeletionKinds);

/** Why books_deletions cannot hold the entry, naming the column and its rule, or null when every column can. */
export function deletionEntryRefusal(entry: BooksDeletionEntry): string | null {
	const refusals = [
		validateRecordId('organisation', entry.organisationId),
		kindRefusal(entry.kind),
		validateRecordId('deleted record', entry.recordId),
		knownAsRefusal(entry.knownAs),
		validateRecordId('account deleting it', entry.deletedByAccountId)
	];
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function kindRefusal(kind: string): string | null {
	if (deletionKinds.includes(kind)) return null;
	return `kind is one of ${deletionKinds.join(', ')}; ${JSON.stringify(kind)} was given.`;
}

function knownAsRefusal(knownAs: string): string | null {
	if (knownAs.trim() !== '') return null;
	return 'known_as is needed: the invoice number or the supplier the deleted record is known by.';
}
