import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';
import { organisationDetailFields, type DetailField } from '$lib/data/organisationDetailGroups';

const migrationFile = 'migrations/0205_organisation_details.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const tableAsFirstMade = readFileSync('migrations/0075_organisations.sql', 'utf8');
const columnsAlreadyThere = ['address', 'accounts_contact_name', 'accounts_contact_email', 'accounts_contact_phone'];
const changesWhatIsThere = /\b(?:drop|delete|truncate|rename|update|insert|alter\s+column)\b/i;

const wasAlreadyThere = (field: DetailField) => columnsAlreadyThere.includes(field.column);
const fieldsAlreadyThere = organisationDetailFields.filter(wasAlreadyThere);
const fieldsAdded = organisationDetailFields.filter((field) => !wasAlreadyThere(field));

function columnAddedFor(field: DetailField): string {
	const lengthCheck = `check (char_length(${field.column}) <= ${field.longest})`;
	return `add column if not exists ${field.column} text not null default '' ${lengthCheck}`;
}

describe('the migration that adds what we must hold about a client', () => {
	it('adds a column for every detail the table did not hold, blank by default and as long as the rules allow', () => {
		expect(fieldsAdded).toHaveLength(13);
		for (const field of fieldsAdded) expect(statements).toContain(columnAddedFor(field));
	});

	it('adds those columns to the organisations table and nothing else', () => {
		expect(statements.match(/add column/g)).toHaveLength(fieldsAdded.length);
		expect(statements.match(/alter table [\w.]+/g)).toEqual(['alter table public.organisations']);
		expect(statements).not.toMatch(/create\s/i);
	});

	it('leaves the address and the accounts contact where they are, at the lengths the rules still state', () => {
		expect(fieldsAlreadyThere).toHaveLength(columnsAlreadyThere.length);
		for (const field of fieldsAlreadyThere) {
			expect(statements).not.toContain(field.column);
			expect(tableAsFirstMade).toContain(`char_length(${field.column}) <= ${field.longest}`);
		}
	});

	it('takes away and rewrites nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements).not.toMatch(changesWhatIsThere);
	});

	it('has the API read the table again, so a save finds the new columns', () => {
		expect(statements).toContain("notify pgrst, 'reload schema'");
	});
});
