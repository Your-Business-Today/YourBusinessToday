import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDataLoss } from '$lib/server/migrations/migrationDataLoss';

const migrationFile = 'migrations/0242_task_deletions.sql';
const migration = readFileSync(migrationFile, 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const takesAwayWhatIsThere = /\b(?:drop\s+(?:table|column|schema|type)|truncate|rename|alter\s+column)\b/i;
const triggersMade = [...statements.matchAll(/create trigger (\w+)\s+[\s\S]*?on (public\.\w+)/g)];
const recordTable = statements.slice(statements.indexOf('create table'), statements.indexOf('create index'));
const [, deleteTasksDefinition] = statements.split('create or replace function public.delete_tasks');
const deleteTasksFunction = 'function public.delete_tasks(uuid[], uuid)';

describe('the migration that stops a deleted task taking finished work with it', () => {
	it('adds the record of deletions with no link to anything that could later empty it', () => {
		expect(statements).toContain('create table if not exists public.task_deletions (');
		expect(recordTable).toContain('record jsonb not null');
		expect(recordTable).not.toContain('references');
	});

	it('lets nobody but the database read or write the record', () => {
		expect(statements).toContain('alter table public.task_deletions enable row level security;');
		expect(statements).not.toContain('create policy');
		expect(statements).not.toMatch(/grant [\w, ]+ on (?:table )?public\.task_deletions/);
	});

	it('takes away nothing already there', () => {
		expect(findDataLoss(migrationFile, migration)).toEqual([]);
		expect(statements).not.toMatch(takesAwayWhatIsThere);
	});

	it('can run twice: the table and indexes only if missing, each function replaced, each trigger put back', () => {
		expect(statements.match(/create function/g)).toBeNull();
		expect(statements.match(/create index (?!if not exists)/g)).toBeNull();
		expect(triggersMade).toHaveLength(2);
		for (const [, triggerName, tableName] of triggersMade) {
			expect(statements).toContain(`drop trigger if exists ${triggerName} on ${tableName};`);
		}
	});

	it('refuses to delete a finished task while its project stands, at every door', () => {
		const projectStands = 'exists (select 1 from public.projects where id = old.project_id)';
		expect(statements).toContain(`if old.status = 'done' and ${projectStands} then`);
		expect(statements).toContain('create trigger finished_task_is_never_deleted\n\tbefore delete on public.tasks');
	});

	it('copies the task and its history into the record as it goes, at every door', () => {
		expect(statements).toContain('to_jsonb(old) || jsonb_build_object(');
		expect(statements).toContain('create trigger task_deletion_is_recorded\n\tbefore delete on public.tasks');
	});

	it('no longer deletes a subtask with its parent, whatever the old link was called', () => {
		expect(statements).toContain("execute format('alter table public.tasks drop constraint %I', parent_link.conname);");
		expect(statements).toContain('foreign key (parent_task_id) references public.tasks (id) on delete no action;');
		expect(statements).not.toContain('on delete cascade');
	});

	it('deletes the tasks named in one statement, with the rights of whoever calls it', () => {
		expect(deleteTasksDefinition).toContain('delete from public.tasks where id = any(target_task_ids);');
		expect(deleteTasksDefinition).toContain('security invoker');
	});

	it('deletes all of them or none, so nobody is told a task went that stayed', () => {
		expect(deleteTasksDefinition).toContain('get diagnostics deleted_count = row_count;');
		expect(deleteTasksDefinition).toContain('if deleted_count <> named_count then');
		expect(deleteTasksDefinition).toContain("raise exception 'Only % of the % tasks named could be deleted, so none of them was.'");
	});

	it('records who is signed in before who the server names, so nobody deletes in another’s name', () => {
		const whoDeleted = "coalesce(auth.uid(), nullif(current_setting('ybt.deleting_account_id', true), '')::uuid)";
		expect(statements).toContain(whoDeleted);
		expect(deleteTasksDefinition).toContain("set_config('ybt.deleting_account_id', coalesce(deleting_account_id::text, ''), true)");
	});

	it('lets a person signed in, and the service, delete by name, and nobody who is not', () => {
		expect(statements).toContain(`revoke all on ${deleteTasksFunction} from public, anon;`);
		expect(statements).toContain(`grant execute on ${deleteTasksFunction} to authenticated, service_role;`);
	});

	it('has the API read the schema again, so a delete finds the new function', () => {
		expect(statements).toContain("notify pgrst, 'reload schema'");
	});
});
