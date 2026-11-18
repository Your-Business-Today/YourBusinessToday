import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { organisationExportTables } from './organisationExportTables';

const migrationsFolder = 'migrations';
const baseSchema = 'docs/sql/base-schema.sql';
const tableDefinition = /create table (?:if not exists )?(?:public\.)?(\w+)\s*\(([\s\S]*?)\n\);/gi;
const organisationColumn = /^\s*organisation_id\s/m;
const reference = /references (?:public\.)?(\w+)/g;

function definitionsOfEveryTable(): Map<string, string> {
	const files = readdirSync(migrationsFolder).filter((file) => file.endsWith('.sql'));
	const texts = [readFileSync(baseSchema, 'utf8'), ...files.map((file) => readFileSync(join(migrationsFolder, file), 'utf8'))];
	const definitions = new Map<string, string>();
	for (const [, tableName, body] of texts.join('\n').matchAll(tableDefinition)) {
		definitions.set(tableName, `${definitions.get(tableName) ?? ''}\n${body}`);
	}
	return definitions;
}

const definitions = definitionsOfEveryTable();
const exportedNames = new Set(organisationExportTables.map((table) => table.tableName));

describe('the tables an organisation exports', () => {
	it('include every table that carries an organisation column', () => {
		const carriers = [...definitions].filter(([, body]) => organisationColumn.test(body)).map(([name]) => name);
		expect(carriers.length).toBeGreaterThan(50);
		for (const tableName of carriers) expect(exportedNames, `${tableName} is left out of the export`).toContain(tableName);
	});

	it('include every table that hangs off one of them without a column of its own', () => {
		const hangers = [...definitions].filter(([name, body]) => !exportedNames.has(name) && referencesAnExportedTable(body));
		expect(hangers.map(([name]) => name)).toEqual([]);
	});

	it('name each table once', () => {
		expect(exportedNames.size).toBe(organisationExportTables.length);
	});
});

function referencesAnExportedTable(body: string): boolean {
	const referenced = [...body.matchAll(reference)].map(([, tableName]) => tableName);
	return referenced.some((tableName) => exportedNames.has(tableName) && tableName !== 'organisations');
}
