import type { SupabaseClient } from '@supabase/supabase-js';
import { deriveProjectMemberships, type DerivedMembership } from '$lib/data/organisationAccess';
import { getMembershipsOfOrganisations } from './getMembershipsOfOrganisations';
import { getOrganisationFamily } from './getOrganisationFamily';
import { getProjectsUnderOrganisations } from './getProjectsUnderOrganisations';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

type DerivedRow = DerivedMembership & { addedBy: string | null };

/**
 * Writes the project memberships an organisation's family grants, as project_members rows marked with
 * the organisation that granted them: rows nobody is owed any more go, rows newly owed arrive, and
 * a direct invitation (no via_organisation_id) is never touched. Runs as the service role, because the
 * person making the change need not reach every project it changes.
 */
export async function syncOrganisationAccess(organisationId: string): Promise<void> {
	const service = supabaseServiceClient();
	const family = await getOrganisationFamily(service, organisationId);
	const familyIds = family.map((organisation) => organisation.id);
	const [memberships, projects, existing] = await Promise.all([
		getMembershipsOfOrganisations(service, familyIds),
		getProjectsUnderOrganisations(service, familyIds),
		getDerivedRows(service, familyIds)
	]);
	const grantedBy = new Map(memberships.map((membership) => [membership.accountId, membership.addedBy]));
	const wanted = deriveProjectMemberships(family, memberships, projects).map((membership) => ({
		...membership,
		addedBy: grantedBy.get(membership.accountId) ?? null
	}));
	await removeRows(service, existing.filter((row) => !isAmong(wanted, row)));
	await addRows(service, wanted.filter((row) => !isAmong(existing, row)));
}

function isAmong(rows: DerivedMembership[], candidate: DerivedMembership): boolean {
	return rows.some((row) => row.projectId === candidate.projectId && row.accountId === candidate.accountId);
}

async function getDerivedRows(service: SupabaseClient, organisationIds: string[]): Promise<DerivedRow[]> {
	if (organisationIds.length === 0) return [];
	const { data, error } = await service
		.from('project_members')
		.select('project_id, account_id, via_organisation_id, added_by')
		.in('via_organisation_id', organisationIds);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		projectId: row.project_id as string,
		accountId: row.account_id as string,
		viaOrganisationId: row.via_organisation_id as string,
		addedBy: (row.added_by as string) ?? null
	}));
}

async function removeRows(service: SupabaseClient, rows: DerivedRow[]): Promise<void> {
	for (const row of rows) {
		const { error } = await service
			.from('project_members')
			.delete()
			.eq('project_id', row.projectId)
			.eq('account_id', row.accountId)
			.not('via_organisation_id', 'is', null);
		if (error) throw error;
	}
}

async function addRows(service: SupabaseClient, rows: DerivedRow[]): Promise<void> {
	if (rows.length === 0) return;
	const { error } = await service.from('project_members').upsert(
		rows.map((row) => ({
			project_id: row.projectId,
			account_id: row.accountId,
			via_organisation_id: row.viaOrganisationId,
			added_by: row.addedBy
		})),
		{ onConflict: 'project_id,account_id', ignoreDuplicates: true }
	);
	if (error) throw error;
}
