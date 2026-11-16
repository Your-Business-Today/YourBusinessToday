import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0243_whole_project_deletion.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const takesAwayWhatIsThere = /\b(?:drop\s+(?:table|column|schema|type)|truncate|rename|alter\s+column)\b/i;
const changesWhatIsStored = /\b(?:create\s+table|alter\s+table|insert\s+into|update\s+public)\b/i;
const triggersMade = [...statements.matchAll(/create trigger (\w+)\s+[\s\S]*?on (public\.\w+)/g)];
const triggerNames = triggersMade.map(([, triggerName]) => triggerName);
const refusalTrigger = 'project_with_finished_tasks_is_never_deleted';
const tasksFirstTrigger = 'tasks_go_before_their_project';
const [, deleteProjectDefinition] = statements.split('create or replace function public.delete_project');
const deleteProjectFunction = 'function public.delete_project(uuid, uuid)';

describe('the migration for a project deleted whole', () => {
	it('takes away nothing already there, and changes no table, column or row', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements).not.toMatch(takesAwayWhatIsThere);
		expect(statements).not.toMatch(changesWhatIsStored);
	});

	it('can run twice: each function replaced, each trigger put back', () => {
		expect(statements.match(/create function/g)).toBeNull();
		expect(triggersMade).toHaveLength(2);
		for (const [, triggerName, tableName] of triggersMade) {
			expect(statements).toContain(`drop trigger if exists ${triggerName} on ${tableName};`);
		}
	});

	it('refuses to delete a project that holds a finished task, at every door', () => {
		const holdsFinishedTask = "exists (select 1 from public.tasks where project_id = old.id and status = 'done')";
		expect(statements).toContain(`if ${holdsFinishedTask} then`);
		expect(statements).toContain(`create trigger ${refusalTrigger}\n\tbefore delete on public.projects`);
	});

	it('deletes the project’s tasks before anything else of it, so each task’s record has its whole history', () => {
		expect(statements).toContain('delete from public.tasks where project_id = old.id;');
		expect(statements).toContain(`create trigger ${tasksFirstTrigger}\n\tbefore delete on public.projects`);
	});

	it('refuses before any task goes: the database fires a table’s triggers in the order of their names', () => {
		expect(triggerNames).toEqual([refusalTrigger, tasksFirstTrigger]);
		expect([...triggerNames].sort()).toEqual(triggerNames);
	});

	it('deletes the project in one statement, with the rights of whoever calls it', () => {
		expect(deleteProjectDefinition).toContain('delete from public.projects where id = target_project_id;');
		expect(deleteProjectDefinition).toContain('security invoker');
	});

	it('says who is deleting for the record of each task, as delete_tasks does', () => {
		const whoIsDeleting = "set_config('ybt.deleting_account_id', coalesce(deleting_account_id::text, ''), true)";
		expect(deleteProjectDefinition).toContain(whoIsDeleting);
	});

	it('refuses when no project went, so nobody is told a project was deleted that stayed', () => {
		const nothingWent = "'The project is no longer there, or is not the caller''s to delete, so nothing was deleted.'";
		expect(deleteProjectDefinition).toContain('get diagnostics deleted_count = row_count;');
		expect(deleteProjectDefinition).toContain('if deleted_count = 0 then');
		expect(deleteProjectDefinition).toContain(`raise exception ${nothingWent}`);
	});

	it('lets a person signed in, and the service, delete by name, and nobody who is not', () => {
		expect(statements).toContain(`revoke all on ${deleteProjectFunction} from public, anon;`);
		expect(statements).toContain(`grant execute on ${deleteProjectFunction} to authenticated, service_role;`);
	});

	it('has the API read the schema again, so a delete finds the new function', () => {
		expect(statements).toContain("notify pgrst, 'reload schema'");
	});
});
