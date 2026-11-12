import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0206_one_projects_list.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const takesAwayWhatIsThere = /\b(?:drop\s+(?:table|column|function|schema|type)|truncate|rename|alter\s+column)\b/i;
const triggersMade = [...statements.matchAll(/create trigger (\w+)\s+[\s\S]*?on (public\.\w+)/g)];

describe('the migration that makes a person’s projects one list', () => {
	it('adds one count to a project, nought by default, so every project keeps the place it has', () => {
		const countAdded = 'add column if not exists team_projects_above integer not null default 0 check (team_projects_above >= 0)';
		expect(statements).toContain(countAdded);
		expect(statements.match(/add column/g)).toHaveLength(1);
		expect(statements.match(/alter table [\w.]+/g)).toEqual(['alter table public.projects']);
	});

	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements).not.toMatch(takesAwayWhatIsThere);
	});

	it('can run twice: each function replaces itself and each trigger is put back as it is', () => {
		expect(statements.match(/create function/g)).toBeNull();
		expect(triggersMade).toHaveLength(3);
		for (const [, triggerName, tableName] of triggersMade) {
			expect(statements).toContain(`drop trigger if exists ${triggerName} on ${tableName};`);
		}
	});

	it('lets a person signed in, and the service, save a list, and nobody who is not', () => {
		const saveFunction = 'function public.save_project_list_order(uuid, uuid[])';
		expect(statements).toContain(`revoke all on ${saveFunction} from public, anon;`);
		expect(statements).toContain(`grant execute on ${saveFunction} to authenticated, service_role;`);
		expect(statements).toContain("if not coalesce(list_owner = auth.uid() or auth.role() = 'service_role', false) then");
	});

	it('never takes a count below nought, so leaving a project cannot fail on the count', () => {
		expect(statements).toContain('greatest(project.team_projects_above - passed.departures, 0)');
	});

	it('has the API read the schema again, so a save finds the new function', () => {
		expect(statements).toContain("notify pgrst, 'reload schema'");
	});
});
