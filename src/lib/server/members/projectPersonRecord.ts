import { parseAccountRecord, type Account } from '$lib/server/accounts/accountRecord';

/** Someone on a project: its owner, a member invited to it, or a member an organisation brought — named by viaOrganisation. */
export type ProjectPerson = Account & { isOwner: boolean; viaOrganisation: string };

export function parseProjectPersonRecord(row: Record<string, unknown>): ProjectPerson {
	return {
		...parseAccountRecord(row),
		isOwner: row.is_owner === true,
		viaOrganisation: (row.via_organisation as string) ?? ''
	};
}
