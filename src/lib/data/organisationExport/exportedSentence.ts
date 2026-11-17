import { describeByteCount } from '$lib/data/taskAttachmentRules';

/** What a finished export carried, as its counts and the links' lifetime. */
export type ExportedCounts = {
	tableCount: number;
	rowCount: number;
	fileCount: number;
	byteCount: number;
	missingFiles: string[];
	partLinks: string[];
};

const linkLifetime = 'an hour';

/** The sentence a finished export is told in, on the page and to a person's Claude. */
export function exportedSentence(organisationName: string, counts: ExportedCounts): string {
	const { partLinks, missingFiles } = counts;
	const partWord = partLinks.length === 1 ? 'one zip' : `${partLinks.length} zips`;
	const missing = missingFiles.length === 0 ? '' : ` ${missingSentence(missingFiles.length)}`;
	return (
		`${organisationName}'s data is exported: ${counts.rowCount} rows in ${counts.tableCount} tables and ` +
		`${counts.fileCount} stored files, ${describeByteCount(counts.byteCount)} in ${partWord}. ` +
		`The download links last ${linkLifetime}, and the export is on the log.${missing}`
	);
}

function missingSentence(missingCount: number): string {
	const fileWord = missingCount === 1 ? 'file' : 'files';
	return `${missingCount} ${fileWord} a record names were no longer in storage; files/missing.txt lists them.`;
}
