import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { readVersionContents, versionColumns } from './readVersionContents';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';
import type { ContextConfirmation } from '$lib/data/companyContext/contextConfirmation';

/** The latest version a client confirmed, whole, with its id so a goal raised from it can keep it. */
export type ConfirmedContextReading = {
	versionId: string;
	context: CompanyContextVersion;
	confirmation: ContextConfirmation;
};

type KeptVersion = { id: string; versionNumber: number };

/** The confirmed context of an organisation: the latest version its client confirmed; none before they confirm one. */
export async function readConfirmedCompanyContext(
	supabase: SupabaseClient,
	organisationId: string
): Promise<ConfirmedContextReading | null> {
	const versions = await readKeptVersions(supabase, organisationId);
	const confirmedAtById = await readConfirmedAt(supabase, versions);
	const confirmedVersion = versions.find((version) => confirmedAtById.has(version.id));
	if (confirmedVersion === undefined) return null;
	const reading = await supabase.from('company_context_versions').select(versionColumns).eq('id', confirmedVersion.id).maybeSingle();
	const context = await readVersionContents(supabase, reading);
	if (context === null) return null;
	const confirmedAt = confirmedAtById.get(confirmedVersion.id) ?? '';
	const confirmation = { versionNumber: confirmedVersion.versionNumber, confirmedAt };
	return { versionId: confirmedVersion.id, context, confirmation };
}

/** Every version the organisation's Claude kept, latest first. */
async function readKeptVersions(supabase: SupabaseClient, organisationId: string): Promise<KeptVersion[]> {
	const { data, error } = await supabase
		.from('company_context_versions')
		.select('id, version_number')
		.eq('organisation_id', organisationId)
		.order('version_number', { ascending: false });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map((row) => ({ id: String(row.id), versionNumber: Number(row.version_number) }));
}

async function readConfirmedAt(supabase: SupabaseClient, versions: KeptVersion[]): Promise<Map<string, string>> {
	if (versions.length === 0) return new Map();
	const { data, error } = await supabase
		.from('company_context_confirmations')
		.select('version_id, confirmed_at')
		.in(
			'version_id',
			versions.map((version) => version.id)
		);
	if (isSchemaNotYetMigrated(error)) return new Map();
	if (error) throw error;
	return new Map(data.map((row) => [String(row.version_id), String(row.confirmed_at)]));
}
