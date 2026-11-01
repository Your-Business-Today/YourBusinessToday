import type { ContinuityCopy } from '$lib/data/continuityCopy';

/** The continuity copy read from a clients row: blank columns, or a database the migration has not reached yet, read as not yet. */
export function parseContinuityCopyRecord(row: Record<string, unknown>): ContinuityCopy {
	return {
		storageConnectedOn: (row.continuity_storage_connected_on ?? null) as string | null,
		copyOpenedOn: (row.continuity_copy_opened_on ?? null) as string | null,
		copyConfirmedBy: (row.continuity_copy_confirmed_by ?? null) as string | null
	};
}

export function toContinuityCopyColumns(continuityCopy: ContinuityCopy): Record<string, unknown> {
	return {
		continuity_storage_connected_on: continuityCopy.storageConnectedOn,
		continuity_copy_opened_on: continuityCopy.copyOpenedOn,
		continuity_copy_confirmed_by: continuityCopy.copyConfirmedBy
	};
}
