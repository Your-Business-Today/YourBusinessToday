import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { formatUkDateTime } from '$lib/data/britishDate';
import type { OrganisationExportRecord } from '$lib/server/organisationExport/organisationExportRecord';

const someoneNoLongerOnFile = 'someone no longer on file';

/** The log of an organisation's exports as the connector tells it, a line an export. */
export function describeOrganisationExports(
	organisationName: string,
	exports: OrganisationExportRecord[],
	exporterNames: Map<string, string>
): string {
	if (exports.length === 0) return `Nothing of ${organisationName}'s has been exported yet.`;
	const lines = exports.map((record) => {
		const held = `${record.rowCount} rows in ${record.tableCount} tables, ${record.fileCount} files, ${describeByteCount(record.byteCount)}`;
		const exporter = exporterNames.get(record.exportedBy ?? '') ?? someoneNoLongerOnFile;
		return `- ${formatUkDateTime(record.exportedAt)} UK time, by ${exporter}: ${held}`;
	});
	return [`${organisationName}'s latest data exports, newest first:`, ...lines].join('\n');
}
