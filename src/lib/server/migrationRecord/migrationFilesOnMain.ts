const migrationModules = import.meta.glob('/migrations/*.sql', { query: '?raw', import: 'default' });

/** The name of every migration file this build of the site carries, in the order the deploy runs them. */
export const migrationFilesOnMain: string[] = Object.keys(migrationModules)
	.map((path) => path.slice(path.lastIndexOf('/') + 1))
	.sort();
