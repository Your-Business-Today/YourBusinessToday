/** The note at the top of every export, saying what it holds and how to read it. */
export function organisationExportReadme(organisationName: string, exportedAt: string): string {
	return [
		`Everything ${organisationName} keeps in Your Business Today's platform, exported ${exportedAt}.`,
		'',
		'data/ holds one CSV file for each table that keeps your rows: your organisation, its people and modules, Books,',
		'Your Business Brain, Boardroom, Brand and the workflow map. The first line of each file names its columns. An',
		'empty cell is an empty value; a list or a set of details is written as JSON. A table with no rows is an empty file.',
		'',
		'files/ holds every file you stored, in its original format, under the bucket it was kept in and its storage_path,',
		'the same path the row that names it gives in its storage_path column. A file a row names that storage no longer',
		'holds is listed in files/missing.txt instead.',
		'',
		'A large export comes in several parts. Each part is a zip of its own; together they hold everything.',
		'Records your company portal keeps are exported from the portal itself, on its Data protection page.',
		''
	].join('\n');
}
