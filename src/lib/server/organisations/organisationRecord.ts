import { organisationDetailFields, readEveryDetail } from '$lib/data/organisationDetailGroups';
import type { OrganisationPlace } from '$lib/data/organisationAccess';
import type { OrganisationDetails } from '$lib/data/organisationRules';

export type Organisation = OrganisationPlace & OrganisationDetails & { createdAt: string };

/** A detail whose column the row does not carry reads blank, so the page stands before the column is added. */
export function parseOrganisationRecord(row: Record<string, unknown>): Organisation {
	return {
		id: row.id as string,
		name: row.name as string,
		...readEveryDetail((field) => (row[field.column] as string) ?? ''),
		createdAt: row.created_at as string
	};
}

export function organisationDetailColumns(details: OrganisationDetails): Record<string, string> {
	const columns = organisationDetailFields.map((field) => [field.column, details[field.key]]);
	return { name: details.name, ...Object.fromEntries(columns) };
}
