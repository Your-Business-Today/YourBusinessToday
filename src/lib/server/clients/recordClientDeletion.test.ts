import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { clientWithEverythingItTakes } from './recordClientDeletion';

const migrationsFolder = join(process.cwd(), 'migrations');
const embeddedTable = /([a-z_]+)\(/g;

function everyMigration(): string {
	const files = readdirSync(migrationsFolder).filter((file) => file.endsWith('.sql'));
	return files.map((file) => readFileSync(join(migrationsFolder, file), 'utf8')).join('\n');
}

function tablesTheCopyReads(): string[] {
	return [...clientWithEverythingItTakes.matchAll(embeddedTable)].map((match) => match[1]);
}

describe('the copy kept of a deleted client', () => {
	const migrations = everyMigration();

	it.each(tablesTheCopyReads())('reads %s, a table the migrations create and never rename away', (table) => {
		const isCreated = new RegExp(`create table (if not exists )?public\\.${table}\\b`).test(migrations);
		const isRenamedAway = new RegExp(`public\\.${table} rename to`).test(migrations);
		expect(isCreated).toBe(true);
		expect(isRenamedAway).toBe(false);
	});
});
