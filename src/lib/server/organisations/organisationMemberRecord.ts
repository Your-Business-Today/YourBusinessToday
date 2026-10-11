import { parseAccountRecord, type Account } from '$lib/server/accounts/accountRecord';

/** Someone on an organisation, with whether they manage it. */
export type OrganisationMember = Account & { isManager: boolean; since: string };

export function parseOrganisationMemberRecord(row: Record<string, unknown>): OrganisationMember {
	return { ...parseAccountRecord(row), isManager: row.is_manager === true, since: row.created_at as string };
}
