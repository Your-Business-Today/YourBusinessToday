import { describe, expect, it } from 'vitest';
import { databaseTaskInstruction, migrationFileAddress, sqlcmdFor } from './databaseTaskInstruction';
import { migrationFilesIn, migrationNameOf } from './migrationFiles';
import { migrationsFolderOf, noDatabase, projectDatabaseRefusal } from './projectDatabase';
import type { ProjectDatabase } from './projectDatabase';

const jewelPfp: ProjectDatabase = {
	kind: 'azure_sql',
	server: 'sql-jpfp-prod.example',
	name: 'jpfp',
	user: 'jpfpadmin',
	migrationsPath: 'api/Data/Migrations'
};

const yourBusinessToday: ProjectDatabase = { ...noDatabase, kind: 'supabase' };

const contactNumbers = 'api/Data/Migrations/20261013100000_ContactNumbers.sql';

describe('the instruction for a database task', () => {
	it('writes the sqlcmd an Azure SQL portal is migrated with', () => {
		expect(sqlcmdFor(jewelPfp, contactNumbers)).toBe(
			'sqlcmd -S sql-jpfp-prod.example -d jpfp -U jpfpadmin ' +
				'-i api/Data/Migrations/20261013100000_ContactNumbers.sql -b -o ContactNumbers.log'
		);
	});

	it('gives a Supabase project the run-migration script and the file on GitHub at the merge commit', () => {
		const instruction = databaseTaskInstruction(yourBusinessToday, {
			repositoryUrl: 'https://github.com/jamesbeadle/YourBusinessToday/',
			commitSha: 'c428de0f',
			branch: 'main',
			filePath: 'migrations/0074_database_tasks.sql'
		});
		expect(instruction.command).toBe('./scripts/run-migration.sh migrations/0074_database_tasks.sql');
		expect(instruction.fileAddress).toBe(
			'https://github.com/jamesbeadle/YourBusinessToday/blob/c428de0f/migrations/0074_database_tasks.sql'
		);
	});

	it('links the branch when the push named no commit, and nothing when the project has no repository', () => {
		const onBranch = { repositoryUrl: 'https://github.com/acme/site', commitSha: '', branch: 'main', filePath: 'a.sql' };
		expect(migrationFileAddress(onBranch)).toBe('https://github.com/acme/site/blob/main/a.sql');
		expect(migrationFileAddress({ ...onBranch, repositoryUrl: '' })).toBeNull();
	});
});

describe('the migration files a push added', () => {
	it('keeps only the SQL files under the migrations folder, once each, in order', () => {
		const added = [
			'migrations/0075_b.sql',
			'migrations/0074_a.sql',
			'migrations/0074_a.sql',
			'migrations/README.md',
			'src/migrations/not.sql'
		];
		expect(migrationFilesIn(added, 'migrations/')).toEqual(['migrations/0074_a.sql', 'migrations/0075_b.sql']);
		expect(migrationFilesIn(added, '')).toEqual([]);
	});

	it('names a migration without its stamp', () => {
		expect(migrationNameOf(contactNumbers)).toBe('ContactNumbers');
		expect(migrationNameOf('migrations/0074_database_tasks.sql')).toBe('database_tasks');
	});

	it('reads the folder the kind usually has when the project names none', () => {
		expect(migrationsFolderOf(yourBusinessToday)).toBe('migrations');
		expect(migrationsFolderOf(jewelPfp)).toBe('api/Data/Migrations');
		expect(migrationsFolderOf(noDatabase)).toBe('');
	});
});

describe('a project’s database details', () => {
	it('accepts a complete Azure SQL project and a bare Supabase one', () => {
		expect(projectDatabaseRefusal(jewelPfp)).toBeNull();
		expect(projectDatabaseRefusal(yourBusinessToday)).toBeNull();
		expect(projectDatabaseRefusal(noDatabase)).toBeNull();
	});

	it('refuses an Azure SQL project missing what sqlcmd needs, an overlong detail and a folder outside the repository', () => {
		expect(projectDatabaseRefusal({ ...jewelPfp, user: '' })).toContain('database user');
		expect(projectDatabaseRefusal({ ...jewelPfp, server: 'a'.repeat(256) })).toContain('255');
		expect(projectDatabaseRefusal({ ...yourBusinessToday, migrationsPath: '/etc' })).toContain('inside the repository');
		expect(projectDatabaseRefusal({ ...yourBusinessToday, migrationsPath: '../x' })).toContain('inside the repository');
	});
});
