const sqlFileSuffix = '.sql';

/** The migration files among the files a push added: those under the migrations folder that are SQL. */
export function migrationFilesIn(addedFiles: string[], migrationsFolder: string): string[] {
	if (migrationsFolder === '') return [];
	const folderPrefix = `${migrationsFolder.replace(/\/+$/, '')}/`;
	const migrations = addedFiles.filter((file) => file.startsWith(folderPrefix) && file.endsWith(sqlFileSuffix));
	return [...new Set(migrations)].sort();
}

/** 20261013100000_ContactNumbers.sql reads as ContactNumbers: the name without its folder, its stamp or its suffix. */
export function migrationNameOf(filePath: string): string {
	const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
	const stem = fileName.endsWith(sqlFileSuffix) ? fileName.slice(0, -sqlFileSuffix.length) : fileName;
	return stem.replace(/^\d+_/, '');
}
