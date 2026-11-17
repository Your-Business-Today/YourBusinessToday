import type { SupabaseClient } from '@supabase/supabase-js';
import { ExportPartPacker, type ExportEntry } from './exportPartPacker';
import { organisationExportEntries, type ExportTally } from './organisationExportEntries';
import { exportPartPath, removeEarlierExportParts, signExportParts, storeExportPart } from './organisationExportStorage';
import { recordOrganisationExport } from './organisationExportRecord';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** A finished export: what it carried, and a download link for each of its parts. */
export type OrganisationExport = ExportTally & { partLinks: string[] };

const bytesInAMegabyte = 1024 * 1024;
const partMegabytes = 40;
const partByteLimit = partMegabytes * bytesInAMegabyte;
const exportedOnDateLength = 10;

/**
 * Exports everything the organisation keeps in the Platform, stores the parts in place of the last export's, logs
 * the export, and hands back the links. The caller has already checked that the person exporting manages the organisation: the service client
 * reads past every row policy.
 */
export async function exportOrganisationData(
	serviceClient: SupabaseClient,
	organisation: Organisation,
	exportedBy: string
): Promise<OrganisationExport> {
	const exportId = crypto.randomUUID();
	const folder = `${organisation.id}/${exportId}`;
	const exportedAt = new Date().toISOString();
	const tally: ExportTally = { tableCount: 0, rowCount: 0, fileCount: 0, byteCount: 0, missingFiles: [] };
	const subject = { serviceClient, organisationId: organisation.id, organisationName: organisation.name, exportedAt };
	await removeEarlierExportParts(serviceClient, organisation.id);
	const partPaths = await storeEveryPart(serviceClient, folder, organisationExportEntries(subject, tally));
	const logged = { id: exportId, organisationId: organisation.id, exportedBy, folder, partCount: partPaths.length };
	await recordOrganisationExport(serviceClient, logged, tally);
	const downloadName = `${organisation.name}-data-${exportedAt.slice(0, exportedOnDateLength)}`;
	const partLinks = await signExportParts(serviceClient, partPaths, downloadName);
	return { ...tally, partLinks };
}

async function storeEveryPart(
	serviceClient: SupabaseClient,
	folder: string,
	entries: AsyncGenerator<ExportEntry>
): Promise<string[]> {
	const packer = new ExportPartPacker(partByteLimit);
	const partPaths: string[] = [];
	const store = async (part: Uint8Array) => {
		const storagePath = exportPartPath(folder, partPaths.length + 1);
		await storeExportPart(serviceClient, storagePath, part);
		partPaths.push(storagePath);
	};
	for await (const entry of entries) {
		const filledPart = packer.add(entry);
		if (filledPart !== null) await store(filledPart);
	}
	const lastPart = packer.finish();
	if (lastPart !== null) await store(lastPart);
	return partPaths;
}
