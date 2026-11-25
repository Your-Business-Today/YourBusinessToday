const keptRecordsByTablePrefix: [tablePrefix: string, keptRecords: string][] = [
	['books_', 'its books'],
	['business_brain', 'its Your Business Brain'],
	['boardroom_directors', 'the directors named to its board'],
	['boardroom_', "its board's meetings and decisions"],
	['brand_', "the content, campaigns, posts or library its brand has made"],
	['clients', 'the clients it keeps'],
	['organisation_data_exports', 'the exports of its data']
];

const referencingTablePatterns = [/referenced from table "([a-z_]+)"/, /constraint "[^"]+" on table "([a-z_]+)"/];

export type DatabaseRefusal = { message?: string; details?: string | null };

/** Says which records an organisation still holds that stopped its delete, read from the database's refusal. */
export function keptRecordRefusal(refusal: DatabaseRefusal): string {
	const keptRecords = keptRecordsNamedBy(referencingTable(refusal));
	return `This organisation still holds ${keptRecords}, which are always kept, so it was not deleted.`;
}

function referencingTable(refusal: DatabaseRefusal): string | null {
	const wording = `${refusal.details ?? ''} ${refusal.message ?? ''}`;
	const matches = referencingTablePatterns.map((pattern) => pattern.exec(wording));
	const match = matches.find((candidate) => candidate !== null);
	return match?.[1] ?? null;
}

function keptRecordsNamedBy(table: string | null): string {
	if (table === null) return 'records';
	const named = keptRecordsByTablePrefix.find(([tablePrefix]) => table.startsWith(tablePrefix));
	return named?.[1] ?? `records in ${table}`;
}
